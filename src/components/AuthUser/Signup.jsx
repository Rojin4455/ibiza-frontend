import { Eye, EyeOff, Lock } from 'lucide-react'
import React from 'react'

function Signup({ setShowPassword2, register, errors, password, showPassword2 }) {
  return (
    <div className="relative">
      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
        Confirm Password
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Lock className="h-5 w-5 text-gray-400" />
        </div>
        <input
          id="confirmPassword"
          type={showPassword2 ? 'text' : 'password'}
          {...register("confirmPassword", {
            required: "Please confirm your password",
            validate: value => 
              value === password || "Passwords do not match"
          })}
          className={`pl-11 pr-11 block w-full rounded-lg border-gray-300 bg-gray-50 focus:ring-2 focus:ring-primary focus:border-transparent py-3 text-sm placeholder-gray-400 ${
            errors.confirmPassword ? 'border-red-500' : ''
          }`}
          placeholder="Confirm your password"
        />
        <button
          type="button"
          onClick={() => setShowPassword2(!showPassword2)}
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
        >
          {showPassword2 ? (
            <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          ) : (
            <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          )}
        </button>
      </div>
      {errors.confirmPassword && (
        <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>
      )}
    </div>
  )
}

export default Signup