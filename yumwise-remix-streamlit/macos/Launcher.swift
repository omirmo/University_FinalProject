import AppKit
import Foundation

private let streamlitArguments = [
    "-u", "-m", "streamlit", "run", "app.py",
    "--server.address=127.0.0.1", "--server.port=0",
    "--server.headless=true", "--browser.serverAddress=127.0.0.1",
    "--logger.hideWelcomeMessage=false",
]

private let localURLPattern = try! NSRegularExpression(
    pattern: #"(?m)^[ \t]*(?:Local )?URL:[ \t]+(http://127\.0\.0\.1:[0-9]+(?:/[^\s]*)?)[ \t]*\r?\n"#
)

func streamlitURL(in output: String) -> URL? {
    let searchRange = NSRange(output.startIndex..<output.endIndex, in: output)
    guard let match = localURLPattern.firstMatch(in: output, range: searchRange),
          let range = Range(match.range(at: 1), in: output),
          let url = URL(string: String(output[range])),
          let port = url.port, (1...65535).contains(port) else { return nil }
    return url
}

private func pythonInterpreter(project: URL) -> URL? {
    let candidates = [
        project.appendingPathComponent(".venv/bin/python"),
        FileManager.default.homeDirectoryForCurrentUser.appendingPathComponent(
            "Desktop/yumwise-demo/.venv/bin/python"
        ),
    ]
    for candidate in candidates where FileManager.default.isExecutableFile(atPath: candidate.path) {
        let probe = Process()
        probe.executableURL = candidate
        probe.currentDirectoryURL = project
        probe.arguments = ["-c", "import streamlit, google.genai, pydantic, httpx"]
        probe.standardOutput = FileHandle.nullDevice
        probe.standardError = FileHandle.nullDevice
        do {
            try probe.run()
            probe.waitUntilExit()
            if probe.terminationStatus == 0 { return candidate }
        } catch {
            continue
        }
    }
    return nil
}

private final class Launcher: NSObject, NSApplicationDelegate {
    private let project = Bundle.main.bundleURL.deletingLastPathComponent()
    private var server: Process?
    private var reader: FileHandle?
    private var startupOutput = Data()
    private var browserURL: URL?

    func applicationDidFinishLaunching(_ notification: Notification) {
        let bar = NSMenu()
        let item = NSMenuItem()
        bar.addItem(item)
        let menu = NSMenu(title: "YumWise")
        item.submenu = menu
        let show = NSMenuItem(title: "פתיחת YumWise בדפדפן", action: #selector(openApplication), keyEquivalent: "o")
        show.target = self
        menu.addItem(show)
        menu.addItem(.separator())
        menu.addItem(withTitle: "יציאה מ־YumWise", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q")
        NSApp.mainMenu = bar
        openApplication()
    }

    func applicationShouldHandleReopen(_ sender: NSApplication, hasVisibleWindows flag: Bool) -> Bool {
        openApplication()
        return false
    }

    func applicationWillTerminate(_ notification: Notification) {
        stopServer()
    }

    @objc private func openApplication() {
        if let browserURL {
            openBrowser(browserURL)
            return
        }
        guard server == nil else { return }
        guard FileManager.default.fileExists(atPath: project.appendingPathComponent("app.py").path),
              FileManager.default.fileExists(atPath: project.appendingPathComponent("frontend/dist/index.html").path)
        else {
            fail("יש לפתוח את YumWise מתוך התיקייה yumwise-remix-streamlit, לצד app.py ותיקיית frontend.")
            return
        }
        guard let interpreter = pythonInterpreter(project: project) else {
            fail("לא נמצאה סביבת Python עם החבילות של YumWise. הוראות ההתקנה הראשונית נמצאות ב־README.md.")
            return
        }
        startServer(with: interpreter)
    }

    private func startServer(with interpreter: URL) {
        let process = Process()
        let pipe = Pipe()
        process.executableURL = interpreter
        process.currentDirectoryURL = project
        process.arguments = streamlitArguments
        process.standardInput = FileHandle.nullDevice
        process.standardOutput = pipe
        process.standardError = pipe
        server = process
        reader = pipe.fileHandleForReading

        reader?.readabilityHandler = { [weak self, weak process] handle in
            let data = handle.availableData
            if data.isEmpty {
                handle.readabilityHandler = nil
                return
            }
            DispatchQueue.main.async {
                guard let self, let process, self.server === process, self.browserURL == nil else { return }
                self.startupOutput.append(data)
                if self.startupOutput.count > 65_536 {
                    self.startupOutput = self.startupOutput.suffix(32_768)
                }
                if let url = streamlitURL(in: String(decoding: self.startupOutput, as: UTF8.self)) {
                    self.browserURL = url
                    self.startupOutput.removeAll()
                    self.openBrowser(url)
                }
            }
        }
        process.terminationHandler = { [weak self] exited in
            DispatchQueue.main.async {
                guard let self, self.server === exited else { return }
                self.fail("שרת YumWise נסגר (קוד \(exited.terminationStatus)). אפשר לנסות לפתוח את האפליקציה שוב.")
            }
        }
        do {
            try process.run()
        } catch {
            fail("לא ניתן היה להפעיל את Streamlit. בדקי שסביבת Python של YumWise זמינה.")
            return
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 25) { [weak self, weak process] in
            guard let self, let process, self.server === process, self.browserURL == nil else { return }
            self.fail("השרת לא סיים לעלות. סגרי את ההודעה ונסי לפתוח שוב את YumWise.")
        }
    }

    private func openBrowser(_ url: URL) {
        if !NSWorkspace.shared.open(url) {
            fail("לא הצלחתי לפתוח את דפדפן ברירת המחדל.")
        }
    }

    private func stopServer() {
        let process = server
        server = nil
        reader?.readabilityHandler = nil
        reader = nil
        if let process, process.isRunning { process.terminate() }
    }

    private func fail(_ message: String) {
        stopServer()
        if #available(macOS 14.0, *) {
            NSApp.activate()
        } else {
            NSApp.activate(ignoringOtherApps: true)
        }
        let alert = NSAlert()
        alert.messageText = "YumWise"
        alert.informativeText = message
        alert.alertStyle = .warning
        alert.addButton(withTitle: "סגירה")
        alert.runModal()
        NSApp.terminate(nil)
    }
}

let application = NSApplication.shared
private let launcher = Launcher()
application.delegate = launcher
application.setActivationPolicy(.regular)
application.run()
