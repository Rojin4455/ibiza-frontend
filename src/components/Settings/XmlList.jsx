import { useState, useRef, useEffect } from "react";
import { RefreshCw, ChevronDown, Plus, X, Users, Check, Search } from "lucide-react";
import axiosInstance from "../../axios/axiosInstance";



export default function XmlList({ toggleUrlActive, handleRefresh, handleRemoveUrl, xmlUrls, locations, openModal }) {
    console.log("xml Urlsss: ", xmlUrls)
    const [urls, setUrls] = useState(xmlUrls);
    const [refreshingItems, setRefreshingItems] = useState({});
    const [openDropdown, setOpenDropdown] = useState(null);
    // const [openModal, setOpenModal] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [loadingSubId, setLoadingSubId] = useState(null);
    const [actionType, setActionType] = useState(null);



    const dropdownRefs = useRef({});



    // Toggle dropdown
    const toggleDropdown = (id) => {
        setOpenDropdown(openDropdown === id ? null : id);
    };

    // Open remove modal
    const handleOpenModal = (id) => {
        // setOpenModal(id);
        // setShowModal(true)
        openModal(id)
    };

    // Close remove modal
    // const handleCloseModal = () => {
    //     setOpenModal(null);
    // };



    // Add subaccount to URL
    const addSubaccount = async (urlId, subaccount) => {
        setLoadingSubId(subaccount.id);
        setActionType('add')
        try {
            const xmlFeed = urls.find(item => item.id === urlId);
            if (!xmlFeed) return;

            const alreadyExists = xmlFeed.subaccounts.some(sub => sub.id === subaccount.id);
            if (alreadyExists) return;

            const updatedSubaccounts = [...xmlFeed.subaccounts.map(s => s.id), subaccount.id];
            console.log("updated subaccounts: ", updatedSubaccounts)

            const res = await axiosInstance.post(`accounts/xmlfeeds/${urlId}/add-subaccounts/`, {
                subaccounts: updatedSubaccounts
            });
            console.log("res: ", res)
            if (res.status === 200) {
                const updatedData = res.data;
                setUrls(prev =>
                    prev.map(item =>
                        item.id === urlId
                            ? {
                                ...item,
                                subaccounts: [
                                    // Keep existing subaccounts
                                    ...item.subaccounts,
                                    // Add only subaccounts that don't already exist
                                    ...updatedData.subaccounts.filter(
                                        newSub => !item.subaccounts.some(existing => existing.id === newSub.id)
                                    )
                                ]
                            }
                            : item
                    )
                );
            } else {
                console.error("Failed to update subaccounts");
            }
        } catch (error) {
            console.error("Error adding subaccount", error);
        } finally {
            setLoadingSubId(null); // End loading
            setActionType(null)

        }
    };

    const removeSubaccount = async (urlId, subaccount) => {
        setLoadingSubId(subaccount.id);
        setActionType("remove");

        try {
            const xmlFeed = urls.find(item => item.id === urlId);
            if (!xmlFeed) return;

            // Filter out the subaccount to be removed
            const updatedSubaccounts = xmlFeed.subaccounts
                .filter(sub => sub.id !== subaccount.id)
                .map(sub => sub.id);

            const res = await axiosInstance.post(`accounts/xmlfeeds/${urlId}/add-subaccounts/`, {
                subaccounts: updatedSubaccounts
            });

            if (res.status === 200) {
                setUrls(prev =>
                    prev.map(item =>
                        item.id === urlId
                            ? {
                                ...item,
                                subaccounts: item.subaccounts.filter(sub => sub.id !== subaccount.id)
                            }
                            : item
                    )
                );
            } else {
                console.error("Failed to remove subaccount");
            }
        } catch (error) {
            console.error("Error removing subaccount", error);
        } finally {
            setLoadingSubId(null);
            setActionType(null);
        }
    };

    // Filter subaccounts that are not already associated with this URL
    const getAvailableSubaccounts = (urlId) => {
        const url = urls.find(item => item.id === urlId);
        if (!url) return [];

        const currentSubaccountIds = url.subaccounts.map(sub => sub.id);
        return locations.filter(sub => !currentSubaccountIds.includes(sub.id));
    };

    // Filter available subaccounts by search term
    const getFilteredAvailableSubaccounts = (urlId) => {
        const available = getAvailableSubaccounts(urlId);
        if (!searchTerm) return available;

        return available.filter(sub =>
            sub.company_name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (openDropdown && dropdownRefs.current[openDropdown] &&
                !dropdownRefs.current[openDropdown].contains(event.target)) {
                setOpenDropdown(null);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [openDropdown]);

    return (
        <div className="max-w-4xl mx-auto">
            <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white shadow">
                {urls.map((item) => (
                    <li key={item.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center">
                            {/* URL details */}
                            <div className="flex-grow truncate mr-4">
                            {item.contact_name && (
                                    <p className="text-lg text-gray-700 mt-1 truncate">
                                        Contact: <span className="font-medium">{item.contact_name}</span>
                                    </p>
                                )}
                                <div className="flex items-center">
                                    <a
                                        href={item.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-indigo-600 hover:text-indigo-900 font-medium truncate"
                                    >
                                        {item.url}
                                    </a>
                                </div>
               
                                <div className="text-xs text-gray-500 mt-1 flex items-center gap-4">
                                    <span>Added on {new Date(item.created_at).toLocaleDateString()}</span>
                                    <span className="flex items-center">
                                        <Users size={14} className="mr-1" />
                                        <span>{item.subaccounts.length} subaccount{item.subaccounts.length !== 1 ? 's' : ''}</span>
                                    </span>
                                </div>
                            </div>

                            {/* Controls */}
                            <div className="flex items-center space-x-3 mt-3 sm:mt-0">
                                <div className="flex items-center">
                                    <span className="mr-2 text-sm text-gray-500">
                                        {item.active ? "Active" : "Inactive"}
                                    </span>
                                    <button
                                        onClick={() => toggleUrlActive(item.id)}
                                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${item.active ? "bg-indigo-600" : "bg-gray-200"
                                            }`}
                                        role="switch"
                                        aria-checked={item.active}
                                    >
                                        <span
                                            aria-hidden="true"
                                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${item.active ? "translate-x-5" : "translate-x-0"
                                                }`}
                                        />
                                    </button>
                                </div>

                                {/* Refresh button */}
                                <button
                                    onClick={() => handleRefresh(item.id)}
                                    disabled={refreshingItems[item.id]}
                                    className={`relative flex items-center justify-center p-2 rounded-full transition-all duration-300 
                    ${refreshingItems[item.id]
                                            ? "bg-blue-100 text-blue-400 cursor-not-allowed"
                                            : "text-blue-500 hover:text-blue-700 hover:bg-blue-50"}`}
                                    title={refreshingItems[item.id] ? "Refreshing feed..." : "Refresh feed"}
                                >
                                    <RefreshCw
                                        className={`w-5 h-5 ${refreshingItems[item.id] ? "animate-spin" : ""}`}
                                    />

                                    {refreshingItems[item.id] && (
                                        <span className="absolute top-full mt-1 whitespace-nowrap text-xs font-medium text-blue-500">
                                            Refreshing...
                                        </span>
                                    )}
                                </button>

                                {/* Subaccounts dropdown */}
                                <div className="relative" ref={el => dropdownRefs.current[item.id] = el}>
                                    <button
                                        onClick={() => toggleDropdown(item.id)}
                                        className="flex items-center space-x-1 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        <Users size={16} />
                                        <span>Subaccounts</span>
                                        <ChevronDown
                                            size={16}
                                            className={`transition-transform ${openDropdown === item.id ? 'rotate-180' : ''}`}
                                        />
                                    </button>

                                    {openDropdown === item.id && (
                                        <div className="absolute right-0 z-10 mt-1 w-72 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                            <div className="p-3 border-b border-gray-100">
                                                <h3 className="text-sm font-medium text-gray-900">Manage Subaccounts</h3>
                                            </div>

                                            {/* Current subaccounts */}
                                            <div className="max-h-48 overflow-y-auto">
                                                {item.subaccounts.length > 0 ? (
                                                    <div className="py-1">
                                                        <p className="px-3 py-1 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Current Access
                                                        </p>
                                                        {item.subaccounts.map(sub => (
                                                            <div key={sub.id} className="px-3 py-2 flex justify-between items-center hover:bg-gray-50">
                                                                <span className="text-sm text-gray-700">{sub.company_name}</span>
                                                                {loadingSubId === sub.id && actionType === "remove" ? (
                                                                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-red-500"></div>
                                                                ) : (
                                                                    <button
                                                                        onClick={() => removeSubaccount(item.id, sub)}
                                                                        className="text-red-500"
                                                                    >
                                                                        <X size={16} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="px-3 py-2 text-sm text-gray-500 italic">
                                                        No subaccounts have access
                                                    </div>
                                                )}

                                                {/* Search and add new subaccounts */}
                                                <div className="border-t border-gray-100 mt-1">
                                                    <p className="px-3 py-1 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Add Subaccount
                                                    </p>
                                                    <div className="px-3 py-2">
                                                        <div className="relative">
                                                            <Search size={16} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                                            <input
                                                                type="text"
                                                                placeholder="Search subaccounts..."
                                                                className="pl-8 w-full p-2 text-sm border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                                                                value={searchTerm}
                                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="max-h-36 overflow-y-auto">
                                                        {getFilteredAvailableSubaccounts(item.id).length > 0 ? (
                                                            getFilteredAvailableSubaccounts(item.id).map(sub => (
                                                                <div
                                                                    key={sub.id}
                                                                    className="px-3 py-2 flex justify-between items-center hover:bg-gray-50 cursor-pointer"
                                                                    onClick={() => addSubaccount(item.id, sub)}
                                                                >
                                                                    <span className="text-sm text-gray-700">{sub.company_name}</span>
                                                                    {loadingSubId === sub.id && actionType === "add" ? (
                                                                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-green-500"></div>
                                                                    ) : (
                                                                        <Plus size={16} className="text-green-500" />
                                                                    )}
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="px-3 py-2 text-sm text-gray-500 italic">
                                                                {searchTerm
                                                                    ? "No matching subaccounts found"
                                                                    : "No more subaccounts available"}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Remove button */}
                                <button
                                    onClick={() => handleOpenModal(item.id)}
                                    className="text-red-500 hover:text-red-700 text-sm font-semibold"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>

            
        </div>
    );
}