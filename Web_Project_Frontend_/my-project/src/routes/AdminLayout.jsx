import React from 'react'
import AdminHeader from '../components/admin/AdminHeader'
import AdminFooter from '../components/admin/AdminFooter'

function AdminLayout({Children}) {
  return (
    <div className="flex flex-col min-h-screen">
    <AdminHeader />
    <main className="flex-grow mh-page">
      <div className="mh-container py-8">
        {Children}
      </div>
    </main>
    <AdminFooter />
  </div>
  )
}

export default AdminLayout
