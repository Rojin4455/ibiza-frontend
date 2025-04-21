import React, { useState } from 'react';
import { Building2, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import Signup from '../components/AuthUser/Signup';
import Signin from '../components/AuthUser/Signin';
import axiosInstance from '../axios/axiosInstance';
import { useDispatch } from 'react-redux';
import { setUser } from '../slices/UserSlice';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';


export default function AuthPages() {
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const dispatch = useDispatch()
  const navigate = useNavigate()
  
  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: ''
    }
  });

  const onSubmit = (data) => {
    console.log(data);
  
    if (!data.confirmPassword) {
      handleLogin(data); // pass data if needed
    } else {
      handleSignup(data); // pass data if needed
    }
  };
  

  const handleLogin = async (data) => {
    try{
        const response = await axiosInstance.post('auth/login/',{
            username:data.email,
            password:data.password
        },{ 
          withCredentials: true
      })
        if(response.status === 200){
            console.log("success response", response)
            let isAdmin = false
            console.log(response.data.user.email)
            if(response.data.user.email === 'dennis@gmail.com'){
                isAdmin = true
            }else{
                isAdmin = false
            }
            dispatch(setUser({accessToken:response.data.access, isAdmin:isAdmin, user:response.data.user}))
            toast.success("successfully login")
            navigate('/')


        }else{
            console.error("error response: ", response)
            toast.error("something went wrong")

        }

    }catch(error){
        console.error("error", error)
        toast.error("something went wrong")

    }
  }

  const handleSignup = async (data) => {
    
  }


  // Toggle between login and signup mode
  const toggleMode = () => {
    setIsLogin(!isLogin);
    reset(); // Reset form values when switching modes
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-100 via-white to-orange-100 p-6">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-8 relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-20 -left-20 w-40 h-40 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
          <div className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-700"></div>
          
          {/* Logo and title */}
          <div className="flex flex-col items-center space-y-3">
            <div className="bg-orange-100 p-4 rounded-full">
              <Building2 className="w-8 h-8 text-secondary" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Ibizaluxury Portal</h1>
            <p className="text-gray-600 text-center">
              {isLogin ? 'Welcome back! Please login to your account.' : 'Create an account to get started'}
            </p>
          </div>

          {/* Auth Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="relative">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  {...register("email", { 
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address"
                    }
                  })}
                  className={`pl-11 block w-full rounded-lg border-gray-300 bg-gray-50 focus:ring-2 focus:ring-primary focus:border-transparent py-3 text-sm placeholder-gray-400 ${
                    errors.email ? 'border-red-500' : ''
                  }`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="relative">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...register("password", { 
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters"
                    }
                  })}
                  className={`pl-11 pr-11 block w-full rounded-lg border-gray-300 bg-gray-50 focus:ring-2 focus:ring-primary focus:border-transparent py-3 text-sm placeholder-gray-400 ${
                    errors.password ? 'border-red-500' : ''
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            {!isLogin && (
        <Signup 
          setShowPassword2={setShowPassword2} 
          register={register}
          errors={errors}
          password={watch("password")} // Watch the password field to use in validation
          showPassword2={showPassword2} 
        />
      )}

            {isLogin && <Signin />}

            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primaryhover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200"
            >
              {isLogin ? 'Sign in' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  {isLogin ? "Don't have an account?" : "Already have an account?"}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={toggleMode}
                className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200"
              >
                {isLogin ? 'Create an account' : 'Sign in instead'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}