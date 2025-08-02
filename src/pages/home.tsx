import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type User = {
  role: string;
  name: string;
  phone: string;
  email: string;
  _id: string;
};

type SubAdmin = {
  role: string;
  name: string;
  email: string;
  phone?: string;
  children?: User[];
  _id: string;
};

type AdminData = {
  role: string;
  name: string;
  phone: string;
  email: string;
  _id: string;
  children?:
    | {
        "sub-admin": SubAdmin;
      }[]
    | User[];
};

const Home: React.FC = () => {
  const [data, setData] = useState<AdminData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const user = sessionStorage.getItem("user");
    const token = sessionStorage.getItem("id");

    if (!user || !token) {
      navigate("/signin");
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API}/api/auth/profile?id=${token}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch profile data");
        }

        const resData = await response.json();
        console.log("check data: ", resData);
        setData(resData);
      } catch (err) {
        console.error("Error fetching data: ", err);
        if (err instanceof Error && err.message.includes("401")) {
          handleLogout();
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("id");
    sessionStorage.removeItem("role");
    navigate("/signin");
  };

  const renderUserCard = (
    item: User | { "sub-admin": SubAdmin },
    isChild = false
  ) => {
    if ("sub-admin" in item) {
      const subAdmin = item["sub-admin"];
      return (
        <div
          key={subAdmin._id}
          className="p-4 rounded-lg shadow bg-blue-50 border-l-4 border-blue-500 mb-3 hover:shadow-md transition-shadow"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-semibold text-gray-800">
                {subAdmin.name}
                <span className="ml-2 text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                  {subAdmin.role}
                </span>
              </h3>
              <p className="text-sm text-gray-600">{subAdmin.email}</p>
              {subAdmin.phone && (
                <p className="text-sm text-gray-600">Phone: {subAdmin.phone}</p>
              )}
            </div>
            <button
              onClick={() => navigate(`/profile/${subAdmin._id}`)}
              className="mt-2 sm:mt-0 px-3 py-1 text-sm bg-white border border-blue-500 text-blue-500 rounded hover:bg-blue-50 transition"
            >
              View Profile
            </button>
          </div>
        </div>
      );
    }

    return (
      <div
        key={item._id}
        className={`p-4 rounded-lg shadow ${
          isChild ? "bg-gray-50" : "bg-white"
        } mb-3 hover:shadow-md transition-shadow`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-semibold text-gray-800">
              {item.name}
              <span className="ml-2 text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                {item.role}
              </span>
            </h3>
            <p className="text-sm text-gray-600">{item.email}</p>
            {item.phone && (
              <p className="text-sm text-gray-600">Phone: {item.phone}</p>
            )}
          </div>
          <button
            onClick={() => navigate(`/profile/${item._id}`)}
            className="mt-2 sm:mt-0 px-3 py-1 text-sm bg-white border border-blue-500 text-blue-500 rounded hover:bg-blue-50 transition"
          >
            View Profile
          </button>
        </div>
      </div>
    );
  };

  const renderTeamSection = () => {
    if (!data) return null;

    if (data.role === "admin") {
      return (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Your Sub-Admins
          </h2>
          <div className="space-y-4">
            {data.children?.map((child) => {
              if ("sub-admin" in child) {
                return (
                  <div
                    key={child["sub-admin"]._id}
                    className="bg-white rounded-lg shadow overflow-hidden"
                  >
                    <div className="p-4 bg-blue-600 text-white">
                      <h3 className="font-semibold">
                        {child["sub-admin"].name}
                      </h3>
                      <p className="text-sm text-blue-100">
                        {child["sub-admin"].email}
                      </p>
                    </div>
                    <div className="p-4">
                      <h4 className="text-sm font-medium text-gray-500 mb-2">
                        Manages {child["sub-admin"]?.children?.length || 0}{" "}
                        users
                      </h4>
                      {child["sub-admin"]?.children?.map((user) => (
                        <div key={user._id} className="ml-4 mt-2">
                          {renderUserCard(user, true)}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>
      );
    } else if (data.role === "sub-admin") {
      return (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Your Users</h2>
          <div className="space-y-4">
            {data.children?.map((user, index) => (
              <div key={index}>{renderUserCard(user, true)}</div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800">
            No profile data found
          </h2>
          <button
            onClick={handleLogout}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            Sonu-Assignment
          </h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 hidden sm:inline">
              Welcome, {data?.name}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 text-sm text-white bg-red-500 rounded hover:bg-red-600 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Your Profile
                </h2>
                <div className="mt-4 space-y-2">
                  <p className="text-gray-600">
                    <span className="font-medium">Role:</span> {data.role}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Name:</span> {data.name}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Email:</span> {data.email}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Phone:</span> {data.phone}
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate(`/profile/${data._id}`)}
                className="mt-4 md:mt-0 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        {renderTeamSection()}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} Assignment. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0 flex space-x-6">
              <a href="#" className="text-sm text-gray-500 hover:text-gray-700">
                Terms
              </a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-700">
                Privacy
              </a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-700">
                Help
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
