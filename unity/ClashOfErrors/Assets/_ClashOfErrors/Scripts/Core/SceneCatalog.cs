using UnityEngine;

namespace ClashOfErrors.Core
{
    [CreateAssetMenu(menuName = "Clash of Errors/Scene Catalog")]
    public sealed class SceneCatalog : ScriptableObject
    {
        [SerializeField] private string startupScene = "PrototypeArena";
        [SerializeField] private string mainMenu = "MainMenu";
        [SerializeField] private string developmentTest = "Development_Test";
        public string StartupScene => startupScene;
        public string MainMenu => mainMenu;
        public string DevelopmentTest => developmentTest;
    }
}
