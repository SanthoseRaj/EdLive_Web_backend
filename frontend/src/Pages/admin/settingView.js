import { FiArrowLeft, FiCheck, FiSettings } from "react-icons/fi";
import  React,{ useState, useEffect ,lazy, Suspense} from "react";



const HiOutlineBell = lazy(() =>
  import("react-icons/hi2").then((module) => ({
    default: module.HiOutlineBell,
  }))
);
const HiOutlineClipboardDocumentList = lazy(() =>
  import("react-icons/hi2").then((module) => ({
    default: module.HiOutlineClipboardDocumentList,
  }))
);
const HiOutlineUserPlus = lazy(() =>
  import("react-icons/hi2").then((module) => ({
    default: module.HiOutlineUserPlus,
  }))
);
const HiOutlineCurrencyDollar = lazy(() =>
  import("react-icons/hi2").then((module) => ({
    default: module.HiOutlineCurrencyDollar,
  }))
);
const HiOutlineCalendar = lazy(() =>
  import("react-icons/hi2").then((module) => ({
    default: module.HiOutlineCalendar,
  }))
);
const HiOutlineTrophy = lazy(() =>
  import("react-icons/hi2").then((module) => ({
    default: module.HiOutlineTrophy,
  }))
);
const HiOutlineDocumentText = lazy(() =>
  import("react-icons/hi2").then((module) => ({
    default: module.HiOutlineDocumentText,
  }))
);
const HiOutlineBookOpen = lazy(() =>
  import("react-icons/hi2").then((module) => ({
    default: module.HiOutlineBookOpen,
  }))
);
const HiOutlineChatBubbleLeftEllipsis = lazy(() =>
  import("react-icons/hi2").then((module) => ({
    default: module.HiOutlineChatBubbleLeftEllipsis,
  }))
);
const HiOutlineWrenchScrewdriver = lazy(() =>
  import("react-icons/hi2").then((module) => ({
    default: module.HiOutlineWrenchScrewdriver,
  }))
);
const HiOutlineUserGroup = lazy(() =>
  import("react-icons/hi2").then((module) => ({
    default: module.HiOutlineUserGroup,
  }))
);
const HiOutlineTruck = lazy(() =>
  import("react-icons/hi2").then((module) => ({
    default: module.HiOutlineTruck,
  }))
);
const HiBuildingLibrary = lazy(() =>
  import("react-icons/hi2").then((module) => ({
    default: module.HiBuildingLibrary,
  }))
);
const HiOutlineShieldCheck = lazy(() =>
  import("react-icons/hi2").then((module) => ({
    default: module.HiOutlineShieldCheck,
  }))
);
const HiOutlineUsers = lazy(() =>
  import("react-icons/hi2").then((module) => ({
    default: module.HiOutlineUsers,
  }))
);
const IconPlaceholder = ({ size = "w-6 h-6" }) => (
  <span
    className={`inline-block ${size} bg-gray-200 rounded-full animate-pulse`}
  ></span>
);
const SettingsPage = () => {

    const iconComponentMap = {
    'HiOutlineBell': HiOutlineBell,
    'HiOutlineClipboardDocumentList': HiOutlineClipboardDocumentList,
    'HiOutlineUserPlus': HiOutlineUserPlus,
    'HiOutlineCurrencyDollar': HiOutlineCurrencyDollar,
    'HiOutlineCalendar': HiOutlineCalendar,
    'HiOutlineTrophy': HiOutlineTrophy,
    'HiOutlineDocumentText': HiOutlineDocumentText,
    'HiOutlineBookOpen': HiOutlineBookOpen,
    'HiOutlineChatBubbleLeftEllipsis': HiOutlineChatBubbleLeftEllipsis,
    'HiOutlineWrenchScrewdriver': HiOutlineWrenchScrewdriver,
    'HiOutlineUserGroup': HiOutlineUserGroup,
    'HiOutlineTruck': HiOutlineTruck,
    'HiBuildingLibrary': HiBuildingLibrary,
    'HiOutlineShieldCheck': HiOutlineShieldCheck,
    'HiOutlineUsers': HiOutlineUsers,
    'FiCheck': FiCheck,
    'FiSettings': FiSettings
  };
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/setting/dashBoardUser`, {
          method: 'GET',
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (!Array.isArray(data)) {
          throw new Error("Invalid data format received from API");
        }

        setSettings(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setSettings([]); // Reset to empty array on error
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);
    
    
    const toggleSetting = async (elementKey) => {
    try {
      const currentSetting = settings.find(s => s.element_key === elementKey);
    if (!currentSetting) return;

    const newStatus = !currentSetting.is_enabled;
      
      setSettings(prev => prev.map(setting => 
      setting.element_key === elementKey 
        ? { ...setting, is_enabled: newStatus } 
        : setting
    ));
      
      // Send update to API
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/setting/updateDashBoard`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        element_key: elementKey,
        is_enabled: newStatus
      })
    });

    if (!response.ok) {
      throw new Error('Failed to update setting');
    }
    } catch (err) {
      console.error("Failed to update setting:", err);
    // Revert if API call fails
    setSettings(prev => prev.map(setting => 
      setting.element_key === elementKey 
        ? { ...setting, is_enabled: !setting.is_enabled } 
        : setting
    ));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg"></span>
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="alert alert-error max-w-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Error loading settings: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm p-4 sticky top-0 z-10">
        <div className="container mx-auto flex items-center">
          <button className="flex items-center text-blue-600">
            <FiArrowLeft className="mr-2" />
            <span>Back</span>
          </button>
          <h1 className="flex-1 text-center text-xl font-semibold">
            <FiSettings className="inline mr-2" />
            Settings
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-4">
        {/* Settings Categories */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button className="bg-blue-100 text-blue-800 p-4 rounded-lg flex items-center justify-center font-medium">
            <span className="text-lg mr-2">📌</span>
            Customize dashboard
          </button>
          <button className="bg-gray-100 text-gray-800 p-4 rounded-lg flex items-center justify-center font-medium">
            <span className="text-lg mr-2">⚙️</span>
            Other settings
          </button>
        </div>

        {/* Settings List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {settings.length > 0 ? (
                          settings.map((setting) => {
                              const IconComponent = iconComponentMap[setting.icon_name] || FiSettings;
                              return (
                                  <SettingsListItem
                                      key={setting.element_key}
                                      IconComponent={IconComponent}
                                      text={setting.title}
                                      active={setting.is_enabled}
                                      onToggle={() => toggleSetting(setting.element_key)}
                                  />
                              );
            })
            ) : (
              <li className="p-4 text-center text-gray-500">
                No dashboard settings available
              </li>
            )}
          </ul>
        </div>
      </main>
    </div>
  );
};

const SettingsListItem = ({ IconComponent, text, active = false, onToggle }) => {
  // Ensure active is always boolean by providing default value
  const isActive = !!active;

  return (
    <li className={`p-4 transition-colors ${isActive ? 'bg-blue-50' : 'bg-white'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className="mr-3">
            <Suspense fallback={<IconPlaceholder size="w-10 h-10" />}>
              <IconComponent className={`w-10 h-10 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
            </Suspense>
          </span>
          <span className={`font-medium ${isActive ? 'text-blue-800' : 'text-gray-600'}`}>
            {text}
          </span>
        </div>
        <label className="cursor-pointer label">
          <input 
            type="checkbox" 
            className="toggle toggle-primary" 
            checked={isActive}
            onChange={onToggle}
          />
        </label>
      </div>
    </li>
  );
};

const getIconForSetting = (elementKey) => {
  const iconMap = {
    'notifications': '🔔',
    'achievements': '🏆',
    'todo': '📝',
    'records': '📄',
    'admission': '➕',
    'classes': '💰',
    'staff': '👥',
    'performance': '📊',
    'events': '📅',
    'messages': '💬',
    'transport': '🚌',
    'library': '📚',
    'subjects': '📖',
    'lab': '🔬',
    'admin': '🛡️',
    'pta': '👨‍👩‍👧‍👦',
    'special_care': '❤️',
    'co_curricular': '⚽',
    'quick_notes': '📝',
    'resources': '📂'
  };

  return iconMap[elementKey] || '⚙️';
};

export default SettingsPage;