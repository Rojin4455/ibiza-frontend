import React from 'react';
import { User, MapPin, Euro, Home, Phone, Mail, Calendar, Clock, Bed, Bath } from 'lucide-react';

const UserProfileSummary = ({ user }) => {
  if (!user) return null;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
      <div className="bg-gradient-to-r from-primary to-primaryhover p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-white p-2 rounded-full shadow-md">
              <User className="h-10 w-10 text-primary" />
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-bold text-white">
                {user.first_name} {user.last_name}
              </h2>
              <div className="flex items-center text-blue-50">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{user.province}, {user.country}</span>
              </div>
            </div>
          </div>
          <div className="bg-secondary text-white px-3 py-1 rounded-full text-sm font-medium">
            {user.type}
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Property Preferences */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Property Preferences</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-gray-600">
                  <Home className="h-4 w-4 mr-2" />
                  <span>Property Type</span>
                </div>
                <span className="font-medium">{user.property_type}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-gray-600">
                  <Euro className="h-4 w-4 mr-2" />
                  <span>Price Range</span>
                </div>
                <span className="font-medium">
                  {formatPrice(user.min_price)} - {formatPrice(user.max_price)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>Frequency</span>
                </div>
                <span className="font-medium">{user.price_freq}</span>
              </div>
            </div>
          </div>

          {/* Requirements */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Requirements</h3>
            <div className="flex items-center mb-3">
              <Bed className="h-5 w-5 text-gray-600 mr-2" />
              <div className="flex items-center">
                <span className="text-gray-600 mr-2">Bedrooms:</span>
                <span className="font-medium">{user.beds}</span>
              </div>
            </div>
            <div className="flex items-center">
              <Bath className="h-5 w-5 text-gray-600 mr-2" />
              <div className="flex items-center">
                <span className="text-gray-600 mr-2">Bathrooms:</span>
                <span className="font-medium">{user.baths}</span>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Contact Information</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <Mail className="h-4 w-4 text-gray-600 mr-2" />
                <span className="text-gray-800">{user.email}</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 text-gray-600 mr-2" />
                <span className="text-gray-800">{user.phone || "Not provided"}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-gray-600 mr-2" />
                <span className="text-gray-600 text-sm">Member since {formatDate(user.date_added)}</span>
              </div>
            </div>
          </div>
        </div>


      </div>
    </div>
  );
};

export default UserProfileSummary;