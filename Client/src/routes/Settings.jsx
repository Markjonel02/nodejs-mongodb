import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
// Removed react-icons imports and will use inline SVGs instead for broader compatibility.

// Placeholder image URL if the user doesn't have a profile picture
const PLACEHOLDER_IMAGE =
  "https://placehold.co/150x150/A78BFA/ffffff?text=User";

// Custom Avatar Component
const Avatar = ({ src, alt, name, size = "md" }) => {
  const [imageError, setImageError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  useEffect(() => {
    setCurrentSrc(src);
    setImageError(false); // Reset error state when src changes
  }, [src]);

  // Determine size classes
  const sizeClasses = {
    sm: "w-16 h-16 text-lg",
    md: "w-24 h-24 text-2xl",
    lg: "w-32 h-32 text-4xl", // This maps to the original "2xl" size
    xl: "w-40 h-40 text-5xl",
    "2xl": "w-48 h-48 text-6xl",
  };

  const selectedSizeClass = sizeClasses[size] || sizeClasses.lg; // Default to 'lg' if unknown size

  const getInitials = (fullName) => {
    if (!fullName) return "U"; // Default initial if no name
    const parts = fullName.split(" ");
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    return (
      parts[0].charAt(0).toUpperCase() +
      parts[parts.length - 1].charAt(0).toUpperCase()
    );
  };

  const initials = getInitials(name);

  return (
    <div
      className={`relative rounded-full overflow-hidden border-4 border-purple-300 shadow-lg flex items-center justify-center bg-purple-100 text-purple-700 font-bold ${selectedSizeClass}`}
    >
      {imageError || !currentSrc ? (
        // Display initials if image fails to load or no src provided
        <span>{initials}</span>
      ) : (
        // Display image
        <img
          src={currentSrc}
          alt={alt}
          className="w-full h-full object-cover"
          onError={() => {
            setImageError(true); // Set error state on image load failure
            setCurrentSrc(null); // Clear src to ensure initials are shown
          }}
        />
      )}
    </div>
  );
};

// Define a simple custom hook for fetching and updating user data
const useUserData = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const showNotification = (title, description, status) => {
    console.log(`Notification: ${status} - ${title}: ${description}`);
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
        "http://localhost:5000/api/user/updateprofile", // Corrected endpoint for update
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
        {/* Inline SVG for FaExclamationCircle */}
        <svg
          className="w-10 h-10 mb-4"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          ></path>
        </svg>
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

          {/* Inline SVG for FaCog */}
          <svg
            className="w-16 h-16 text-purple-600 mb-4 relative z-10"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M11.49 4.09A10.023 10.023 0 0010 2a8 8 0 100 16 10.023 10.023 0 001.49-2.09l-.49-.49a6 6 0 11-8.48-8.48l.49-.49zM10 12a2 2 0 100-4 2 2 0 000 4z"
              clipRule="evenodd"
            ></path>
          </svg>
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
              {/* Using the custom Avatar component */}
              <Avatar
                src={profileImagePreview}
                alt="Profile Picture"
                name={userData?.name}
                size="lg" // Use 'lg' to map to the previous 2xl equivalent styling
              />

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
                             relative z-10"
                  disabled={isImageUploading}
                >
                  {/* Inline SVG for FiCamera */}
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.865-1.73A2 2 0 0110.707 4h2.586a2 2 0 011.664.89l.865 1.73A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    ></path>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    ></path>
                  </svg>
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
                  {/* Inline SVG for FaUpload */}
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M2 9.5A5.5 5.5 0 0010.5 4V2a1 1 0 011-1h1a1 1 0 011 1v2h2a1 1 0 011 1v1a1 1 0 01-1 1h-2v2a1 1 0 01-1 1v1a1 1 0 01-1-1v-1H9.5A5.5 5.5 0 004 18.5a5.5 5.5 0 005.5-5.5h-1a4.5 4.5 0 01-9 0V9.5zM15 10a1 1 0 00-1 1v2.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L16 13.586V11a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
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
                  {/* Inline SVG for FaEdit */}
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.38-2.828-2.827z"></path>
                  </svg>
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
                    {/* Inline SVG for FaUserEdit */}
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
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
                    {/* Inline SVG for FaEnvelope */}
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
                    </svg>
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
                      {/* Inline SVG for FaSave */}
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                          clipRule="evenodd"
                        ></path>
                      </svg>
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
