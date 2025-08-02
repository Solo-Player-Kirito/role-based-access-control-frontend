import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface UserType {
  _id: string;
  type: string;
  name: string;
}

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingTypes, setIsFetchingTypes] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    selectedParent: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API}/api/auth/usertypes`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch user types");
        }
        const data = await response.json();
        setUserType(data);
      } catch (err: unknown) {
        console.error("Error fetching user types: ", err);
        setError("Failed to load user types. Please try again later.");
      } finally {
        setIsFetchingTypes(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const parent = userType.find((p) => p._id === formData.selectedParent);

      let type = "admin";
      if (parent?.type === "admin") type = "sub-admin";
      else if (parent?.type === "sub-admin") type = "user";

      const finalPayload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        type,
        parentId: parent?._id || null,
      };

      const response = await fetch(
        `${process.env.REACT_APP_API}/api/auth/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(finalPayload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Registration failed");
      }

      const data = await response.json();
      sessionStorage.setItem("id", data.user._id);
      sessionStorage.setItem("user", "true");
      sessionStorage.setItem("role", data.role);

      navigate("/");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Registration failed";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Create Account</h2>
          <p className="text-gray-600 mt-2">Join us today and get started</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="enter your name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="enter your email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              placeholder="enter your phone"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="enter your password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>

          <div>
            <label
              htmlFor="selectedParent"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              if u do not select then u will become admin (just for test purpose
              not real-life scenario)
            </label>
            <select
              id="selectedParent"
              name="selectedParent"
              value={formData.selectedParent}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isFetchingTypes}
            >
              <option value="">Select Parent</option>
              {isFetchingTypes ? (
                <option value="" disabled>
                  Loading user types...
                </option>
              ) : (
                userType.map((parent) => (
                  <option key={parent._id} value={parent._id}>
                    {parent.name} - ({parent.type})
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        <button
          type="submit"
          className={`w-full mt-6 py-3 px-4 rounded-lg font-medium text-white transition-colors ${
            isLoading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing...
            </span>
          ) : (
            "Register"
          )}
        </button>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/signin")}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Sign in
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};

export default SignUp;
