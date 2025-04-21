import { useState } from 'react'
import { Dialog } from '@headlessui/react'
import { Send, X } from 'lucide-react'
import axiosInstance from '../axios/axiosInstance'
import { toast } from 'sonner'

export default function EmailSender({selectedProperties, userId}) {
    console.log("selected properties: ", selectedProperties)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [message, setMessage] = useState('')

  const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set("selection", "True");  // Adds or updates the param

    const selec_url = currentUrl.toString();

  const handleSendEmail = async () => {
    const confirmSend = window.confirm("Are you sure you want to send the email?")
    if (confirmSend) {
      // send your message logic here
      console.log("Message sent:", message)
      try{
        const response = await axiosInstance.put(`accounts/contacts/${userId}`,{
            remarks:message,
            properties:selectedProperties,
            selec_url:selec_url
        })
        if(response.status === 200){
            console.log("response success: ", response)
            toast.success("Email sent successfully")
        }else{
            console.error("error response :", response)
            toast.error("Something went wrong")

        }
      }catch(error){
        toast.error("Something went wrong")

        console.log("something went wrong: ", error)
      }
      setIsModalOpen(false)
      setMessage('')
    }
  }

  return (
    <div className="flex justify-center mt-10">
      {/* Initial Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-secondary hover:bg-orange-500 text-white px-6 py-3 rounded-lg text-sm font-medium shadow-md transition"
      >
        Send Email
      </button>

      {/* Modal */}
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl transition-all">
            <div className="flex justify-between items-center mb-4">
              <Dialog.Title className="text-lg font-semibold text-gray-800">
                Compose Email
              </Dialog.Title>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="h-5 w-5 text-gray-500 hover:text-gray-700" />
              </button>
            </div>

            <textarea
              placeholder="Remarks to customer..."
              className="w-full h-40 border border-gray-300 rounded-lg p-4 focus:ring-2 focus:ring-primary focus:outline-none text-sm resize-none"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSendEmail}
                className="flex items-center bg-primary hover:bg-primaryhover text-white px-5 py-2 rounded-lg text-sm font-medium transition"
              >
                <Send className="h-4 w-4 mr-2" />
                Send Email
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  )
}
