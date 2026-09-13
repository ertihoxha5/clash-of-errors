using System;
using System.IO;
using Unity.CodeEditor;
using UnityEditor;
using UnityEngine;

namespace ClashOfErrors.Editor
{
    public static class CodeSetup
    {
        public static void Configure()
        {
            var executable = Environment.GetEnvironmentVariable("CLASH_VSCODE_PATH");
            if (string.IsNullOrWhiteSpace(executable) || !File.Exists(executable))
                throw new InvalidOperationException("Set CLASH_VSCODE_PATH to the installed VS Code executable. This machine preference is never stored in project source.");
            CodeEditor.SetExternalScriptEditor(executable);
            CodeEditor.CurrentEditor.SyncAll();
            Debug.Log("VS Code external script editor configured; solution regenerated.");
        }
    }
}
