import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
// React Icons can sometimes be a problem in certain environments if not globally available.
// For robustness and to address "could not resolve" errors,
// we'll use inline SVGs or simpler textual icons if external icon libraries fail.
// However, given `react-icons/fa` and `react-icons/fi` were mentioned, let's include them for now,
// but be aware that if compilation still fails, they might need to be replaced with inline SVGs.
import {
  FaUserEdit,
  FaEnvelope,
  FaUpload,
  FaSave,
  FaCog,
  FaCheckCircle,
  FaExclamationCircle,
  FaEdit,
} from "react-icons/fa";
import { FiCamera } from "react-icons/fi"; // For the camera icon on image upload

// Placeholder image URL if the user doesn't have a profile picture
const PLACEHOLDER_IMAGE =
  "https://placehold.co/150x150/A78BFA/ffffff?text=User";

// Define a simple custom hook for fetching and updating user data
const useUserData = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Using a custom toast/notification system since Chakra UI is being removed.
  // In a real app, you'd implement a simple modal or inline message component.
  const showNotification = (title, description, status) => {
    // This is a placeholder for a custom notification system.
    // In a full app, you'd render a div with these messages.
    console.log(`Notification: ${status} - ${title}: ${description}`);
    // For now, we'll just use a simple alert-like behavior for quick feedback
    // Note: avoid window.alert in production, use a custom modal.
    // Here we'll just log and rely on visual cues (spinners, error messages).
  };

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("jwtToken");
      if (!token) {
        throw new Error("No authentication token found. Please log in.");
      }
      const { data } = await axios.get(
        "http://localhost:5000/api/user/profile",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUserData(data);
      console.log("Fetched user data:", data); // Debugging
    } catch (err) {
      console.error("Error fetching user profile:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to load user profile.";
      setError(errorMessage);
      showNotification("Profile Load Failed", errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updatedFields) => {
    try {
      const token = localStorage.getItem("jwtToken");
      const { data } = await axios.put(
        "http://localhost:5000/api/user/profile",
        updatedFields,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUserData(data);
      showNotification(
        "Profile Updated",
        "Your profile details have been saved.",
        "success"
      );
      console.log("User profile updated:", data); // Debugging
      return true;
    } catch (err) {
      console.error("Error updating user profile:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to update profile.";
      showNotification("Update Failed", errorMessage, "error");
      return false;
    }
  };

  const uploadProfileImage = async (imageFile) => {
    try {
      const token = localStorage.getItem("jwtToken");
      const formData = new FormData();
      formData.append("profileImage", imageFile); // 'profileImage' must match the field name in multer setup

      const { data } = await axios.post(
        "http://localhost:5000/api/user/profile/upload-image",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUserData(data); // Update user data with new image URL
      showNotification(
        "Image Uploaded",
        "Your profile picture has been updated.",
        "success"
      );
      console.log("Profile image uploaded:", data); // Debugging
      return true;
    } catch (err) {
      console.error("Error uploading profile image:", err);
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to upload image.";
      showNotification("Upload Failed", errorMessage, "error");
      return false;
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    userData,
    loading,
    error,
    fetchProfile,
    updateProfile,
    uploadProfileImage,
  };
};

const Settings = () => {
  const {
    userData,
    loading,
    error,
    fetchProfile,
    updateProfile,
    uploadProfileImage,
  } = useUserData();
  const [editedUserData, setEditedUserData] = useState({});
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // State to control form editability
  const fileInputRef = useRef(null);

  // Initialize editedUserData when userData is fetched
  useEffect(() => {
    if (userData) {
      setEditedUserData({
        name: userData.name || "",
        email: userData.email || "",
      });
      // Ensure the full backend URL is used for images
      setProfileImagePreview(
        userData.profileImageUrl
          ? `http://localhost:5000${userData.profileImageUrl}`
          : PLACEHOLDER_IMAGE
      );
    }
  }, [userData]);

  // Handle form field changes
  const handleChange = (e) => {
    setEditedUserData({
      ...editedUserData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle profile image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImageFile(file);
      setProfileImagePreview(URL.createObjectURL(file)); // Create URL for immediate preview
    } else {
      setProfileImageFile(null);
      setProfileImagePreview(
        userData?.profileImageUrl
          ? `http://localhost:5000${userData.profileImageUrl}`
          : PLACEHOLDER_IMAGE
      ); // Revert to old image or placeholder
    }
  };

  // Handle saving user details
  const handleSaveDetails = async () => {
    setIsSubmitting(true);
    const success = await updateProfile(editedUserData);
    if (success) {
      setIsEditing(false); // Exit editing mode on successful save
    }
    setIsSubmitting(false);
  };

  // Handle uploading profile image
  const handleImageUpload = async () => {
    if (!profileImageFile) return;
    setIsImageUploading(true);
    await uploadProfileImage(profileImageFile);
    setProfileImageFile(null); // Clear file input after upload
    // The image preview will update via the useEffect when userData changes
    setIsImageUploading(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="flex items-center">
          {/* Spinner equivalent */}
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-purple-500"></div>
          <p className="ml-4 text-gray-600">Loading user profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 text-red-500 p-8 text-center">
        <FaExclamationCircle className="w-10 h-10 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Error Loading Profile</h2>
        <p className="text-md">{error}</p>
        <button
          className="mt-6 px-6 py-2 rounded-full bg-purple-500 text-white hover:bg-purple-600 transition-all duration-200"
          onClick={fetchProfile}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div
      className="p-8 min-h-screen flex flex-col justify-center items-center
                 bg-gradient-to-br from-f0e6fa to-dcd0ff font-inter" // Tailwind gradient
    >
      <div className="space-y-8 w-full md:w-3/4 lg:w-1/2 max-w-4xl my-8">
        {/* Header Section */}
        <div
          className="relative flex flex-col items-center justify-center text-center mb-6 p-6
                        bg-white rounded-xl shadow-2xl overflow-hidden"
        >
          {/* Decorative blobs */}
          <div className="absolute top-[-50px] left-[-50px] w-48 h-48 rounded-full bg-purple-100 opacity-30 filter blur-3xl z-0"></div>
          <div className="absolute bottom-[-50px] right-[-50px] w-44 h-44 rounded-full bg-pink-100 opacity-30 filter blur-3xl z-0"></div>

          <FaCog className="w-16 h-16 text-purple-600 mb-4 relative z-10" />
          <h1 className="text-4xl font-extrabold text-purple-800 relative z-10">
            Settings
          </h1>
          <p className="text-lg text-gray-600 mt-2 relative z-10">
            Manage your profile details and preferences.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          {/* Profile Picture Card */}
          <div
            className="bg-white shadow-xl rounded-xl p-6 flex flex-col items-center justify-center
                          border-2 border-purple-200"
          >
            <h2 className="text-xl font-semibold text-purple-700 pb-4">
              Profile Picture
            </h2>
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-purple-300 shadow-lg">
                <img
                  src={profileImagePreview}
                  alt="Profile Picture"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = PLACEHOLDER_IMAGE;
                  }} // Fallback on error
                />
              </div>

              <label htmlFor="file-upload" className="cursor-pointer">
                <input
                  id="file-upload"
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="flex items-center px-6 py-2 border border-purple-500 text-purple-500 rounded-full
                             hover:bg-purple-50 hover:text-purple-600 transition-all duration-200
                             relative z-10" // Added z-10 to ensure button is clickable
                  disabled={isImageUploading}
                >
                  <FiCamera className="mr-2" />
                  {isImageUploading ? (
                    <span className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-purple-500 mr-2"></div>{" "}
                      Uploading...
                    </span>
                  ) : profileImageFile ? (
                    "Change Image"
                  ) : (
                    "Select Image"
                  )}
                </button>
              </label>

              {profileImageFile && (
                <button
                  onClick={handleImageUpload}
                  className="flex items-center px-6 py-2 bg-purple-500 text-white rounded-full
                             hover:bg-purple-600 transition-all duration-200
                             disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isImageUploading || !profileImageFile}
                >
                  <FaUpload className="mr-2" />
                  Upload Image
                </button>
              )}
            </div>
          </div>

          {/* User Details Card */}
          <div className="bg-white shadow-xl rounded-xl p-6 border-2 border-purple-200">
            <div className="flex justify-between items-center pb-4">
              <h2 className="text-xl font-semibold text-purple-700">
                Your Details
              </h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 border border-purple-500 text-purple-500 rounded-full hover:bg-purple-50
                             transition-all duration-200"
                >
                  <FaEdit />
                </button>
              )}
            </div>
            <div className="space-y-5">
              <div>
                <label
                  htmlFor="name"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUserEdit className="text-gray-400" />
                  </span>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={editedUserData.name}
                    onChange={handleChange}
                    placeholder="Your Name"
                    disabled={!isEditing || isSubmitting}
                    className="shadow appearance-none border rounded-md w-full py-2 px-10 text-gray-700 leading-tight
                                focus:outline-none focus:shadow-outline focus:border-purple-500
                                disabled:opacity-70 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Email
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="text-gray-400" />
                  </span>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={editedUserData.email}
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                    disabled={!isEditing || isSubmitting}
                    className="shadow appearance-none border rounded-md w-full py-2 px-10 text-gray-700 leading-tight
                                focus:outline-none focus:shadow-outline focus:border-purple-500
                                disabled:opacity-70 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
              {isEditing && (
                <button
                  onClick={handleSaveDetails}
                  className="flex items-center px-6 py-2 bg-purple-500 text-white rounded-full
                             hover:bg-purple-600 transform hover:scale-105 transition-all duration-200
                             disabled:opacity-50 disabled:cursor-not-allowed self-end mt-4"
                  disabled={
                    isSubmitting ||
                    !editedUserData.name ||
                    !editedUserData.email
                  }
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>{" "}
                      Saving...
                    </span>
                  ) : (
                    <>
                      <FaSave className="mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
