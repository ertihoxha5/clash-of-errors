using System;
using System.Linq;
using UnityEditor;
using UnityEditor.PackageManager;
using UnityEditor.PackageManager.Requests;
using UnityEngine;

namespace ClashOfErrors.Editor
{
    public static class PackageSetup
    {
        private static readonly string[] Required = { "com.unity.render-pipelines.universal", "com.unity.inputsystem", "com.unity.cinemachine", "com.unity.ai.navigation", "com.unity.ugui", "com.unity.ide.visualstudio" };
        private static ListRequest list;
        private static AddAndRemoveRequest add;
        private static double deadline;

        [MenuItem("Clash of Errors/Phase 0/1. Verify Packages")]
        public static void Install()
        {
            if (list != null || add != null) throw new InvalidOperationException("Package verification is already running.");
            list = Client.List(true, true);
            deadline = EditorApplication.timeSinceStartup + 600;
            EditorApplication.update += Poll;
        }

        private static void Poll()
        {
            if (EditorApplication.timeSinceStartup > deadline) { Finish("Package resolution timed out."); return; }
            if (list != null && list.IsCompleted)
            {
                if (list.Status != StatusCode.Success) { Finish(list.Error.message); return; }
                var installed = list.Result.ToDictionary(p => p.name, p => p.version);
                var missing = Required.Where(id => !installed.ContainsKey(id)).ToList();
                if (installed.TryGetValue("com.unity.ide.visualstudio", out var version) && new Version(version.Split('-')[0]) < new Version(2, 0, 20))
                    missing.Add("com.unity.ide.visualstudio@2.0.20");
                list = null;
                if (missing.Count == 0) { Finish(null); return; }
                Debug.Log("Installing only missing dependencies: " + string.Join(", ", missing));
                add = Client.AddAndRemove(missing.ToArray());
            }
            if (add != null && add.IsCompleted) Finish(add.Status == StatusCode.Success ? null : add.Error.message);
        }

        private static void Finish(string error)
        {
            EditorApplication.update -= Poll;
            list = null; add = null;
            if (error != null) Debug.LogError(error); else Debug.Log("Phase 0 packages resolved. Review Packages/manifest.json and packages-lock.json.");
            if (Application.isBatchMode) EditorApplication.Exit(error == null ? 0 : 1);
        }
    }
}
