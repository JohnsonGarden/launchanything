import AppKit
import Foundation

// LaunchServices is the supported way to launch a .app with environment and arguments.
// Keep this executable unsandboxed: macOS ignores OpenConfiguration.environment
// when the caller is sandboxed. Data arrives as JSON over stdin, never via shell.
private struct Request: Decodable {
    let path: String
    let environment: [String: String]
    let arguments: [String]
}

private struct Response: Encodable {
    let pid: Int32?
    let error: String?
}

private func emit(_ result: Response, exitCode: Int32) -> Never {
    if let data = try? JSONEncoder().encode(result) {
        FileHandle.standardOutput.write(data)
        FileHandle.standardOutput.write(Data([0x0A]))
    }
    exit(exitCode)
}

private let request: Request
do {
    request = try JSONDecoder().decode(Request.self, from: FileHandle.standardInput.readDataToEndOfFile())
} catch {
    emit(Response(pid: nil, error: "Invalid launch request: \(error.localizedDescription)"), exitCode: 2)
}

let url = URL(fileURLWithPath: request.path)
var isDirectory: ObjCBool = false
let exists = FileManager.default.fileExists(atPath: url.path, isDirectory: &isDirectory)
guard exists && isDirectory.boolValue && url.pathExtension.lowercased() == "app" else {
    emit(Response(pid: nil, error: "Select an existing .app bundle."), exitCode: 2)
}

guard let bundle = Bundle(url: url), let bundleID = bundle.bundleIdentifier else {
    emit(Response(pid: nil, error: "The selected application has no bundle identifier."), exitCode: 2)
}

// A running instance can absorb a new launch and silently ignore proxy settings.
if !NSRunningApplication.runningApplications(withBundleIdentifier: bundleID).isEmpty {
    emit(Response(pid: nil, error: "This app is already running. Quit it completely, then launch it again with LaunchAnything."), exitCode: 3)
}

let configuration = NSWorkspace.OpenConfiguration()
configuration.environment = request.environment
configuration.arguments = request.arguments
configuration.activates = true
configuration.createsNewApplicationInstance = true

let semaphore = DispatchSemaphore(value: 0)
var launchedPID: Int32?
var launchError: String?
NSWorkspace.shared.openApplication(at: url, configuration: configuration) { running, error in
    launchedPID = running?.processIdentifier
    launchError = error?.localizedDescription
    semaphore.signal()
}

if semaphore.wait(timeout: .now() + 30) == .timedOut {
    emit(Response(pid: nil, error: "macOS did not confirm the launch within 30 seconds."), exitCode: 4)
}
if let launchError {
    emit(Response(pid: nil, error: launchError), exitCode: 4)
}
guard let launchedPID else {
    emit(Response(pid: nil, error: "macOS returned no running application."), exitCode: 4)
}
emit(Response(pid: launchedPID, error: nil), exitCode: 0)
