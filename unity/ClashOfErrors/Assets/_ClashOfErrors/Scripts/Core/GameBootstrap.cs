using System.Collections;
using UnityEngine;

namespace ClashOfErrors.Core
{
    [DisallowMultipleComponent]
    public sealed class GameBootstrap : MonoBehaviour
    {
        [SerializeField] private SceneLoader sceneLoader;
        [SerializeField] private SceneCatalog sceneCatalog;

        private IEnumerator Start()
        {
            if (sceneLoader == null || sceneCatalog == null)
            { Debug.LogError("Bootstrap requires a SceneLoader and SceneCatalog.", this); yield break; }
            // Bootstrap is only placed in the first scene. Its loader survives a transition.
            DontDestroyOnLoad(gameObject);
            Application.targetFrameRate = 60;
#if UNITY_WEBGL && !UNITY_EDITOR
            WebGLInput.captureAllKeyboardInput = false;
#endif
            yield return sceneLoader.Load(sceneCatalog.StartupScene);
        }
    }
}
