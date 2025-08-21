// components/ProfileModal.jsx
import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const ProfileModal = ({ onClose, user, setUser }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(user?.profile);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected);
    if (selected) {
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleUpload = async () => {
    if (!file) return toast.error("Please select an image");
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await axios.post("/api/user/upload-profile", formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" }
      });

      setUser(res.data.user); // update user in AuthContext
      toast.success("Profile updated!");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload profile picture");
    }
  };
  //remove profile
  const handleRemove = async () => {
  try {
    const res = await axios.put("/api/user/remove-profile", {}, {
      withCredentials: true
    });

    setUser(res.data.user); // update UI
    toast.success("Profile removed!");
    onClose();
  } catch (err) {
    console.error(err);
    toast.error("Failed to remove profile picture");
  }
};

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
      <div className="bg-white p-4 rounded-lg w-[300px] space-y-4">
        <h2 className="text-xl font-bold">Update Profile Picture</h2>
        <img src={preview} alt="Preview" className="w-24 h-24 rounded-full mx-auto" />
        <input type="file" accept="image/*"  name="profile" onChange={handleFileChange} className="text-amber-300 bg-gray-300 px-0 py-1 w-full rounded" />
        <div className="flex justify-between">
          <button onClick={onClose} className="bg-gray-300 px-3 py-1 rounded">Cancel</button>
            <button onClick={handleRemove} className="bg-yellow-500 text-white px-3 py-1 rounded">Remove</button>
          <button onClick={handleUpload} className="bg-blue-500 text-white px-3 py-1 rounded">Upload</button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
