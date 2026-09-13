using System;
using System.IO;
using System.Linq;
using ClashOfErrors.Core;
using UnityEditor;
using UnityEditor.Build.Reporting;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.Rendering;

namespace ClashOfErrors.Editor
{
    public static class WebBuild
    {
        [MenuItem("Clash of Errors/Phase 0/3. Build Web")]
        public static void Build()
        {
            if (!BuildPipeline.IsBuildTargetSupported(BuildTargetGroup.WebGL, BuildTarget.WebGL))
                throw new InvalidOperationException("Install Web Build Support for this exact Editor in Unity Hub.");
            if (!Application.isBatchMode && !EditorSceneManager.SaveCurrentModifiedScenesIfUserWantsTo()) return;
            Validate();
            var project = Directory.GetParent(Application.dataPath).FullName;
            var repository = Directory.GetParent(project).Parent.FullName;
            // Each build has its own staging directory. The publisher never deletes unrelated files.
            var output = Path.Combine(repository, "artifacts/unity", DateTime.UtcNow.ToString("yyyyMMdd-HHmmss-fff"));
            PlayerSettings.companyName = "Clash of Errors";
            PlayerSettings.productName = "Clash of Errors";
            PlayerSettings.WebGL.template = "PROJECT:ClashHost";
            // Fallback produces .unityweb files and decompresses in Unity's loader,
            // so the existing static host does not need Content-Encoding overrides.
            PlayerSettings.WebGL.compressionFormat = WebGLCompressionFormat.Gzip;
            PlayerSettings.WebGL.decompressionFallback = true;
            // Unity 6000.6 can loop its Bee build program with hashed filenames.
            // Timestamped output names already give each build distinct asset URLs.
            PlayerSettings.WebGL.nameFilesAsHashes = false;
            PlayerSettings.WebGL.threadsSupport = false;
            PlayerSettings.SetGraphicsAPIs(BuildTarget.WebGL, new[] { GraphicsDeviceType.OpenGLES3 });
            PlayerSettings.defaultWebScreenWidth = 1280;
            PlayerSettings.defaultWebScreenHeight = 720;
            var report = BuildPipeline.BuildPlayer(new BuildPlayerOptions {
                scenes = FoundationSetup.SceneNames.Select(FoundationSetup.ScenePath).ToArray(),
                locationPathName = output, target = BuildTarget.WebGL, options = BuildOptions.None
            });
            if (report.summary.result != BuildResult.Succeeded)
                throw new InvalidOperationException($"Web build failed: {report.summary.result}, {report.summary.totalErrors} errors. See Editor log.");
            File.WriteAllText(Path.Combine(repository, "artifacts/unity/latest-build.txt"), output);
            Debug.Log($"CLASH_WEB_BUILD_SUCCEEDED: {output}. Run node scripts/publish-unity-build.mjs to copy it to website assets.");
        }

        [MenuItem("Clash of Errors/Phase 0/Validate Foundation")]
        public static void Validate()
        {
            FoundationSetup.ValidateBootstrap(AssetDatabase.LoadAssetAtPath<GameObject>($"{FoundationSetup.Root}/Prefabs/GameBootstrap.prefab"));
            var catalog = AssetDatabase.LoadAssetAtPath<SceneCatalog>($"{FoundationSetup.Root}/Settings/SceneCatalog.asset");
            if (catalog == null || !FoundationSetup.SceneNames.Contains(catalog.StartupScene)) throw new InvalidOperationException("Invalid startup scene catalog.");
            var previous = EditorSceneManager.GetSceneManagerSetup();
            try
            {
                foreach (var name in FoundationSetup.SceneNames)
                {
                    var path = FoundationSetup.ScenePath(name);
                    if (!File.Exists(path)) throw new FileNotFoundException("Run Prepare Foundation first.", path);
                    var scene = EditorSceneManager.OpenScene(path);
                    var objects = scene.GetRootGameObjects().SelectMany(go => go.GetComponentsInChildren<Transform>(true)).ToArray();
                    foreach (var obj in objects)
                        if (GameObjectUtility.GetMonoBehavioursWithMissingScriptCount(obj.gameObject) > 0) throw new InvalidOperationException($"Missing script in {name}: {obj.name}");
                    if (name == "Bootstrap")
                    {
                        var bootstraps = objects.Select(t => t.GetComponent<GameBootstrap>()).Where(b => b != null).ToArray();
                        if (bootstraps.Length != 1) throw new InvalidOperationException("Bootstrap scene must have exactly one bootstrap.");
                        FoundationSetup.ValidateBootstrap(bootstraps[0].gameObject);
                    }
                    if (name == "PrototypeArena" && !objects.Any(t => t.GetComponent<Camera>() != null)) throw new InvalidOperationException("PrototypeArena needs its fixed camera.");
                }
            }
            finally { if (previous.Length > 0) EditorSceneManager.RestoreSceneManagerSetup(previous); }
            Debug.Log("Phase 0 scene and prefab references validated.");
        }
    }
}
