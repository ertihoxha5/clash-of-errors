using System.Collections;
using UnityEngine;
using UnityEngine.SceneManagement;

namespace ClashOfErrors.Core
{
    public sealed class SceneLoader : MonoBehaviour
    {
        public bool IsLoading { get; private set; }

        public IEnumerator Load(string destination)
        {
            if (IsLoading) { Debug.LogError("A scene transition is already running.", this); yield break; }
            if (string.IsNullOrWhiteSpace(destination) || !Application.CanStreamedLevelBeLoaded(destination))
            { Debug.LogError($"Scene '{destination}' is missing from the build scene list.", this); yield break; }
            IsLoading = true;
            var operation = SceneManager.LoadSceneAsync(destination, LoadSceneMode.Single);
            if (operation == null) { IsLoading = false; Debug.LogError($"Could not load {destination}.", this); yield break; }
            yield return operation;
            IsLoading = false;
        }
    }
}
