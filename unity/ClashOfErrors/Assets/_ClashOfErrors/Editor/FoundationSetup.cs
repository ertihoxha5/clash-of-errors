using System;
using System.IO;
using System.Linq;
using ClashOfErrors.Core;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.InputSystem;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;
using UnityEngine.SceneManagement;

namespace ClashOfErrors.Editor
{
    public static class FoundationSetup
    {
        public const string Root = "Assets/_ClashOfErrors";
        public static readonly string[] SceneNames = { "Bootstrap", "MainMenu", "PrototypeArena", "Development_Test" };
        public static string ScenePath(string name) => $"{Root}/Scenes/{name}.unity";

        [MenuItem("Clash of Errors/Phase 0/2. Prepare Foundation")]
        public static void Prepare()
        {
            if (!Application.isBatchMode && !EditorSceneManager.SaveCurrentModifiedScenesIfUserWantsTo()) return;
            var previous = EditorSceneManager.GetSceneManagerSetup();
            try
            {
                foreach (var folder in new[] { "Scenes", "Settings", "Scripts/Core", "Scripts/Player", "Scripts/Combat", "Scripts/AI", "Scripts/Interaction", "Scripts/Inventory", "Editor", "Prefabs", "Materials", "Models", "Animations", "Audio", "UI", "VFX", "ScriptableObjects" })
                    Directory.CreateDirectory($"{Root}/{folder}");
                AssetDatabase.Refresh();
                if (GraphicsSettings.defaultRenderPipeline == null)
                {
                    var pipeline = AssetDatabase.LoadAssetAtPath<UniversalRenderPipelineAsset>("Assets/Settings/Mobile_RPAsset.asset");
                    if (pipeline == null) throw new InvalidOperationException("Missing URP template pipeline asset.");
                    GraphicsSettings.defaultRenderPipeline = pipeline;
                }
                if (!(GraphicsSettings.defaultRenderPipeline is UniversalRenderPipelineAsset))
                    throw new InvalidOperationException("An existing URP asset must be assigned in Graphics settings. Use the 3D URP template.");
                PrepareLayers();
                PrepareInput();
                var palette = new[] { new Color(.025f, .045f, .12f), new Color(0, .8f, 1), new Color(1, .08f, .16f), new Color(.85f, .04f, .7f), new Color(.1f, 1, .4f) };
                var labels = new[] { "NavyGround", "CyanPlayer", "RedEnemy", "MagentaCorruption", "GreenInteractable" };
                for (int i = 0; i < labels.Length; i++)
                    if (Existing<Material>($"{Root}/Materials/{labels[i]}.mat") == null)
                    {
                        var material = new Material(Shader.Find("Universal Render Pipeline/Unlit"));
                        material.SetColor("_BaseColor", palette[i]);
                        AssetDatabase.CreateAsset(material, $"{Root}/Materials/{labels[i]}.mat");
                    }
                var catalogPath = $"{Root}/Settings/SceneCatalog.asset";
                var catalog = Existing<SceneCatalog>(catalogPath);
                if (catalog == null) { catalog = ScriptableObject.CreateInstance<SceneCatalog>(); AssetDatabase.CreateAsset(catalog, catalogPath); }
                var prefabPath = $"{Root}/Prefabs/GameBootstrap.prefab";
                var prefab = Existing<GameObject>(prefabPath);
                if (prefab == null)
                {
                    var obj = new GameObject("GameBootstrap");
                    var loader = obj.AddComponent<SceneLoader>();
                    var bootstrap = obj.AddComponent<GameBootstrap>();
                    var serialized = new SerializedObject(bootstrap);
                    serialized.FindProperty("sceneLoader").objectReferenceValue = loader;
                    serialized.FindProperty("sceneCatalog").objectReferenceValue = catalog;
                    serialized.ApplyModifiedPropertiesWithoutUndo();
                    prefab = PrefabUtility.SaveAsPrefabAsset(obj, prefabPath);
                    UnityEngine.Object.DestroyImmediate(obj);
                }
                ValidateBootstrap(prefab);
                foreach (var name in SceneNames)
                {
                    if (Existing<SceneAsset>(ScenePath(name)) != null) { Debug.Log($"Preserved existing scene: {name}"); continue; }
                    var scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);
                    if (name == "Bootstrap") PrefabUtility.InstantiatePrefab(prefab, scene);
                    else if (name == "PrototypeArena") CreateSmokeScene(labels);
                    if (!EditorSceneManager.SaveScene(scene, ScenePath(name))) throw new IOException($"Could not save {name}.");
                }
                var foundation = SceneNames.Select(n => new EditorBuildSettingsScene(ScenePath(n), true));
                var other = EditorBuildSettings.scenes.Where(s => !SceneNames.Any(n => ScenePath(n) == s.path));
                EditorBuildSettings.scenes = foundation.Concat(other).ToArray();
                AssetDatabase.SaveAssets();
                Debug.Log("Phase 0 foundation prepared. Existing assets preserved; Bootstrap is first in build settings.");
            }
            finally { if (previous.Length > 0) EditorSceneManager.RestoreSceneManagerSetup(previous); }
        }

        private static T Existing<T>(string path) where T : UnityEngine.Object
        {
            var asset = AssetDatabase.LoadAssetAtPath<T>(path);
            if (asset == null && File.Exists(path)) throw new InvalidOperationException($"Conflicting or invalid asset at {path}; resolve it manually.");
            return asset;
        }

        // One-time correction for the initial generated palette. Normal Prepare never
        // overwrites materials. Reject any palette that has been artist-modified.
        public static void RepairInitialPalette()
        {
            var labels = new[] { "NavyGround", "CyanPlayer", "RedEnemy", "MagentaCorruption", "GreenInteractable" };
            var colors = new[] { new Color(.025f, .045f, .12f), new Color(0, .8f, 1), new Color(1, .08f, .16f), new Color(.85f, .04f, .7f), new Color(.1f, 1, .4f) };
            var materials = labels.Select(name => AssetDatabase.LoadAssetAtPath<Material>($"{Root}/Materials/{name}.mat")).ToArray();
            for (int i = 0; i < materials.Length; i++)
                if (materials[i] == null || materials[i].GetColor("_BaseColor") != colors[i] ||
                    (materials[i].shader.name != "Universal Render Pipeline/Lit" && materials[i].shader.name != "Universal Render Pipeline/Unlit"))
                    throw new InvalidOperationException($"Palette conflict: {labels[i]}. Preserve this material and review manually.");
            for (int i = 0; i < materials.Length; i++)
            {
                materials[i].shader = Shader.Find("Universal Render Pipeline/Unlit");
                materials[i].SetColor("_BaseColor", colors[i]);
                EditorUtility.SetDirty(materials[i]);
            }
            AssetDatabase.SaveAssets();
            Debug.Log("Initial smoke palette corrected to URP Unlit for deterministic color verification.");
        }

        public static void ValidateBootstrap(GameObject prefab)
        {
            if (prefab == null || !prefab.TryGetComponent<GameBootstrap>(out var bootstrap)) throw new InvalidOperationException("Bootstrap prefab is missing its component.");
            var serialized = new SerializedObject(bootstrap);
            if (serialized.FindProperty("sceneLoader").objectReferenceValue == null || serialized.FindProperty("sceneCatalog").objectReferenceValue == null)
                throw new InvalidOperationException("Bootstrap prefab has missing serialized references; fix it before building.");
        }

        private static void PrepareLayers()
        {
            var settings = new SerializedObject(AssetDatabase.LoadAllAssetsAtPath("ProjectSettings/TagManager.asset")[0]);
            var layers = settings.FindProperty("layers");
            foreach (var name in new[] { "Player", "Enemy", "Ground", "Environment", "Weapon", "Projectile", "Pickup", "Interactable" })
            {
                if (LayerMask.NameToLayer(name) >= 0) continue;
                int index = Enumerable.Range(8, 24).FirstOrDefault(i => string.IsNullOrEmpty(layers.GetArrayElementAtIndex(i).stringValue));
                if (index < 8) throw new InvalidOperationException($"No free layer slot for {name}.");
                layers.GetArrayElementAtIndex(index).stringValue = name;
                settings.ApplyModifiedPropertiesWithoutUndo();
            }
        }

        private static void PrepareInput()
        {
            var path = $"{Root}/Settings/ClashInput.inputactions";
            if (Existing<InputActionAsset>(path) != null) return;
            var input = ScriptableObject.CreateInstance<InputActionAsset>();
            var player = input.AddActionMap("Player");
            var move = player.AddAction("Move", InputActionType.Value, expectedControlLayout: "Vector2");
            move.AddCompositeBinding("2DVector").With("Up", "<Keyboard>/w").With("Down", "<Keyboard>/s").With("Left", "<Keyboard>/a").With("Right", "<Keyboard>/d");
            player.AddAction("Look", InputActionType.Value, "<Mouse>/delta", expectedControlLayout: "Vector2");
            string[] names = { "Fire", "Aim", "Jump", "Sprint", "Crouch", "Reload", "Interact", "Ability", "Inventory", "Pause" };
            string[] bindings = { "<Mouse>/leftButton", "<Mouse>/rightButton", "<Keyboard>/space", "<Keyboard>/leftShift", "<Keyboard>/c", "<Keyboard>/r", "<Keyboard>/e", "<Keyboard>/q", "<Keyboard>/tab", "<Keyboard>/escape" };
            for (int i = 0; i < names.Length; i++) player.AddAction(names[i], InputActionType.Button, bindings[i]);
            player.FindAction("Crouch").AddBinding("<Keyboard>/leftCtrl");
            for (int i = 1; i <= 5; i++) player.AddAction($"InventorySlot{i}", InputActionType.Button, $"<Keyboard>/{i}");
            var ui = input.AddActionMap("UI");
            var navigate = ui.AddAction("Navigate", InputActionType.Value, expectedControlLayout: "Vector2");
            navigate.AddCompositeBinding("2DVector").With("Up", "<Keyboard>/upArrow").With("Down", "<Keyboard>/downArrow").With("Left", "<Keyboard>/leftArrow").With("Right", "<Keyboard>/rightArrow");
            navigate.AddBinding("<Gamepad>/leftStick"); navigate.AddBinding("<Gamepad>/dpad");
            ui.AddAction("Submit", InputActionType.Button, "<Keyboard>/enter").AddBinding("<Gamepad>/buttonSouth");
            ui.AddAction("Cancel", InputActionType.Button, "<Keyboard>/escape").AddBinding("<Gamepad>/buttonEast");
            ui.AddAction("Point", InputActionType.PassThrough, "<Mouse>/position", expectedControlLayout: "Vector2");
            ui.AddAction("Click", InputActionType.PassThrough, "<Mouse>/leftButton", expectedControlLayout: "Button");
            ui.AddAction("ScrollWheel", InputActionType.PassThrough, "<Mouse>/scroll", expectedControlLayout: "Vector2");
            File.WriteAllText(path, input.ToJson());
            UnityEngine.Object.DestroyImmediate(input);
            AssetDatabase.ImportAsset(path);
        }

        private static void CreateSmokeScene(string[] palette)
        {
            var camera = new GameObject("Fixed smoke-test camera").AddComponent<Camera>();
            camera.tag = "MainCamera";
            camera.transform.position = new Vector3(9, 8, -12);
            camera.transform.LookAt(new Vector3(0, .6f, 0));
            camera.clearFlags = CameraClearFlags.SolidColor;
            camera.backgroundColor = new Color(.025f, .035f, .075f);
            camera.gameObject.AddComponent<AudioListener>();
            camera.gameObject.AddComponent<UniversalAdditionalCameraData>();
            var light = new GameObject("Key light").AddComponent<Light>();
            light.type = LightType.Directional; light.intensity = 2;
            light.transform.rotation = Quaternion.Euler(45, -30, 0);
            RenderSettings.ambientMode = AmbientMode.Flat;
            RenderSettings.ambientLight = new Color(.35f, .4f, .5f);
            var positions = new[] { Vector3.zero, new Vector3(-3, 1, 0), new Vector3(3, 1, 0), new Vector3(0, 1, 3), new Vector3(0, .6f, -3) };
            var layers = new[] { "Ground", "Player", "Enemy", "Environment", "Interactable" };
            var shapes = new[] { PrimitiveType.Plane, PrimitiveType.Capsule, PrimitiveType.Cube, PrimitiveType.Sphere, PrimitiveType.Cylinder };
            for (int i = 0; i < palette.Length; i++)
            {
                var obj = GameObject.CreatePrimitive(shapes[i]); obj.name = palette[i]; obj.layer = LayerMask.NameToLayer(layers[i]);
                obj.transform.position = positions[i];
                if (i == 0) obj.transform.localScale = new Vector3(2, 1, 2);
                obj.GetComponent<Renderer>().sharedMaterial = AssetDatabase.LoadAssetAtPath<Material>($"{Root}/Materials/{palette[i]}.mat");
            }
        }
    }
}
