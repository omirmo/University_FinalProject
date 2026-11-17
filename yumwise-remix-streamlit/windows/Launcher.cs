using System;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Net;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Windows.Forms;

sealed class AppServer : IDisposable
{
    static readonly Regex LocalAddress = new Regex(@"^\s*(?:Local )?URL:\s*(http://127\.0\.0\.1:[0-9]{1,5}/?)\s*$");
    Process process;

    public bool Running { get { return process != null && !process.HasExited; } }

    public async Task<Uri> Start(string apiKey)
    {
        Dispose();
        string project = AppDomain.CurrentDomain.BaseDirectory;
        string python = Path.Combine(project, "runtime", "python.exe");
        if (!File.Exists(python) || !File.Exists(Path.Combine(project, "app.py")))
            throw new InvalidOperationException("חלצו את כל קובצי החבילה לתיקייה אחת, ואז פתחו ממנה את YumWise.exe.");

        var info = new ProcessStartInfo(python,
            "-u -m streamlit run app.py --server.address=127.0.0.1 --server.port=0" +
            " --server.headless=true --browser.serverAddress=127.0.0.1 --logger.hideWelcomeMessage=false");
        info.WorkingDirectory = project;
        info.UseShellExecute = false;
        info.CreateNoWindow = true;
        info.RedirectStandardOutput = true;
        info.RedirectStandardError = true;
        if (!String.IsNullOrWhiteSpace(apiKey))
            info.EnvironmentVariables["GEMINI_API_KEY"] = apiKey;

        var ready = new TaskCompletionSource<Uri>(TaskCreationOptions.RunContinuationsAsynchronously);
        var child = new Process { StartInfo = info, EnableRaisingEvents = true };
        child.OutputDataReceived += (_, line) =>
        {
            if (line.Data == null) return;
            Match match = LocalAddress.Match(line.Data);
            if (match.Success) ready.TrySetResult(new Uri(match.Groups[1].Value));
        };
        child.ErrorDataReceived += (_, line) => { };
        child.Exited += (_, args) => ready.TrySetException(
            new InvalidOperationException("השרת המקומי נסגר לפני שהיה אפשר לפתוח את YumWise."));

        try
        {
            child.Start();
            process = child;
            child.BeginOutputReadLine();
            child.BeginErrorReadLine();
            if (await Task.WhenAny(ready.Task, Task.Delay(30000)) != ready.Task)
                throw new TimeoutException("השרת המקומי לא סיים לעלות. נסו לפתוח את YumWise שוב.");
            return await ready.Task;
        }
        catch
        {
            if (process == null) child.Dispose();
            Dispose();
            throw;
        }
    }

    public void Dispose()
    {
        if (process == null) return;
        try { if (!process.HasExited) process.Kill(); }
        catch (InvalidOperationException) { }
        finally { process.Dispose(); process = null; }
    }
}

sealed class YumWiseWindow : Form
{
    static readonly string KeyFile = Path.Combine(
        Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "YumWise", "gemini-key.bin");
    readonly AppServer server = new AppServer();
    readonly Label status = new Label { AutoSize = true };
    readonly Button open = new Button { AutoSize = true, Text = "פתיחה בדפדפן" };
    readonly Button change = new Button { AutoSize = true, Text = "הגדרת Gemini" };
    string key = LoadKey();
    Uri url;

    public YumWiseWindow()
    {
        Text = "YumWise";
        RightToLeft = RightToLeft.Yes;
        RightToLeftLayout = true;
        StartPosition = FormStartPosition.CenterScreen;
        ClientSize = new Size(390, 112);
        FormBorderStyle = FormBorderStyle.FixedDialog;
        MaximizeBox = false;

        var layout = new FlowLayoutPanel { Dock = DockStyle.Fill, Padding = new Padding(14) };
        layout.Controls.Add(status);
        layout.SetFlowBreak(status, true);
        layout.Controls.Add(open);
        layout.Controls.Add(change);
        var close = new Button { AutoSize = true, Text = "סגירה" };
        layout.Controls.Add(close);
        Controls.Add(layout);

        Shown += async (_, args) =>
        {
            if (String.IsNullOrWhiteSpace(key) && !File.Exists(Path.Combine(
                AppDomain.CurrentDomain.BaseDirectory, ".streamlit", "secrets.toml")))
                EditKey();
            await StartAndOpen();
        };
        open.Click += async (_, args) =>
        {
            if (server.Running && url != null) OpenBrowser();
            else await StartAndOpen();
        };
        change.Click += async (_, args) => { if (EditKey()) await StartAndOpen(); };
        close.Click += (_, args) => Close();
        FormClosed += (_, args) => server.Dispose();
    }

    static string LoadKey()
    {
        string fromEnvironment = Environment.GetEnvironmentVariable("GEMINI_API_KEY");
        if (!String.IsNullOrWhiteSpace(fromEnvironment)) return fromEnvironment.Trim();
        if (!File.Exists(KeyFile)) return "";
        try
        {
            return Encoding.UTF8.GetString(ProtectedData.Unprotect(
                File.ReadAllBytes(KeyFile), null, DataProtectionScope.CurrentUser));
        }
        catch (IOException) { return ""; }
        catch (CryptographicException) { return ""; }
        catch (UnauthorizedAccessException) { return ""; }
    }

    bool EditKey()
    {
        using (var dialog = new Form
        {
            Text = "מפתח Gemini", RightToLeft = RightToLeft.Yes, RightToLeftLayout = true,
            ClientSize = new Size(380, 118), StartPosition = FormStartPosition.CenterParent,
            FormBorderStyle = FormBorderStyle.FixedDialog, MinimizeBox = false, MaximizeBox = false
        })
        {
            var instruction = new Label
            {
                Text = "הדביקו מפתח API אישי מ־Google AI Studio.", Bounds = new Rectangle(12, 10, 356, 24)
            };
            var input = new TextBox
            {
                Bounds = new Rectangle(12, 37, 356, 27), UseSystemPasswordChar = true, RightToLeft = RightToLeft.No
            };
            var save = new Button { Text = "שמירה", Bounds = new Rectangle(12, 77, 110, 27), DialogResult = DialogResult.OK };
            var cancel = new Button { Text = "ביטול", Bounds = new Rectangle(130, 77, 110, 27), DialogResult = DialogResult.Cancel };
            dialog.Controls.AddRange(new Control[] { instruction, input, save, cancel });
            dialog.AcceptButton = save;
            dialog.CancelButton = cancel;
            dialog.ActiveControl = input;
            if (dialog.ShowDialog(this) != DialogResult.OK || String.IsNullOrWhiteSpace(input.Text)) return false;
            key = input.Text.Trim();
        }
        try
        {
            Directory.CreateDirectory(Path.GetDirectoryName(KeyFile));
            File.WriteAllBytes(KeyFile, ProtectedData.Protect(
                Encoding.UTF8.GetBytes(key), null, DataProtectionScope.CurrentUser));
        }
        catch (IOException) { KeyNotSaved(); }
        catch (CryptographicException) { KeyNotSaved(); }
        catch (UnauthorizedAccessException) { KeyNotSaved(); }
        return true;
    }

    void KeyNotSaved()
    {
        MessageBox.Show(this, "המפתח יפעל בהרצה הנוכחית. לא ניתן היה לשמור אותו להרצה הבאה.", "YumWise");
    }

    async Task StartAndOpen()
    {
        url = null;
        open.Enabled = change.Enabled = false;
        status.Text = "מפעיל את YumWise…";
        try
        {
            url = await server.Start(key);
            if (IsDisposed) return;
            status.Text = "YumWise מוכנה לשימוש.";
            OpenBrowser();
        }
        catch (Exception error)
        {
            if (IsDisposed) return;
            status.Text = "ההפעלה נכשלה.";
            MessageBox.Show(this, error.Message, "YumWise");
        }
        finally
        {
            if (!IsDisposed) open.Enabled = change.Enabled = true;
        }
    }

    void OpenBrowser()
    {
        try { Process.Start(new ProcessStartInfo(url.AbsoluteUri) { UseShellExecute = true }); }
        catch (System.ComponentModel.Win32Exception)
        {
            MessageBox.Show(this, "כתובת האפליקציה: " + url.AbsoluteUri, "YumWise");
        }
    }

    [STAThread]
    static int Main(string[] args)
    {
        if (args.Length == 1 && args[0] == "--smoke-test")
        {
            using (var server = new AppServer())
            {
                Uri home = server.Start(null).GetAwaiter().GetResult();
                using (var web = new WebClient())
                {
                    web.Proxy = null;
                    return web.DownloadString(new Uri(home, "/_stcore/health")).Trim() == "ok" ? 0 : 1;
                }
            }
        }
        Application.EnableVisualStyles();
        Application.SetCompatibleTextRenderingDefault(false);
        Application.Run(new YumWiseWindow());
        return 0;
    }
}
