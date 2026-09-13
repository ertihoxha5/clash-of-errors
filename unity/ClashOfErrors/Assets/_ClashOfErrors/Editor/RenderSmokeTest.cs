using System;
using System.IO;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;

namespace ClashOfErrors.Editor
{
    public static class RenderSmokeTest
    {
        [MenuItem("Clash of Errors/Phase 0/Render Smoke Frame")]
        public static void Render()
        {
            if (!Application.isBatchMode && !EditorSceneManager.SaveCurrentModifiedScenesIfUserWantsTo()) return;
            var previous = EditorSceneManager.GetSceneManagerSetup();
            var previousTarget = RenderTexture.active;
            RenderTexture target = null;
            Texture2D pixels = null;
            try
            {
                EditorSceneManager.OpenScene(FoundationSetup.ScenePath("PrototypeArena"));
                var camera = Camera.main;
                if (camera == null) throw new InvalidOperationException("Smoke scene camera is missing.");
                target = new RenderTexture(1280, 720, 24);
                pixels = new Texture2D(1280, 720, TextureFormat.RGB24, false);
                target.Create();
                var request = new UniversalRenderPipeline.SingleCameraRequest { destination = target };
                RenderPipeline.SubmitRenderRequest(camera, request);
                RenderTexture.active = target;
                pixels.ReadPixels(new Rect(0, 0, 1280, 720), 0, 0);
                pixels.Apply();
                var repo = Directory.GetParent(Application.dataPath).Parent.Parent.FullName;
                var output = Path.Combine(repo, "artifacts/unity/editor-smoke.png");
                Directory.CreateDirectory(Path.GetDirectoryName(output));
                File.WriteAllBytes(output, pixels.EncodeToPNG());
                Debug.Log($"Editor smoke frame saved: {output}. This verifies Editor rendering, not browser rendering.");
            }
            finally
            {
                RenderTexture.active = previousTarget;
                if (target != null) { target.Release(); UnityEngine.Object.DestroyImmediate(target); }
                if (pixels != null) UnityEngine.Object.DestroyImmediate(pixels);
                if (previous.Length > 0) EditorSceneManager.RestoreSceneManagerSetup(previous);
            }
        }
    }
}
