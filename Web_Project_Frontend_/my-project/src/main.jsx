import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom'
import './index.css'
import Login from './components/Login.jsx'
import Signup from './components/Signup.jsx'
import UserDashboard from './components/user/UserDashboard.jsx'
import Dashboard from './components/admin/Dashboard.jsx'
import AdminLayout from './routes/AdminLayout.jsx'
import MovieManagement from './components/admin/MovieManagement.jsx'
import UserManagement from './components/admin/userManagement/UserManagement.jsx'
import AddUser from './components/admin/userManagement/AddUser.jsx'
import UserUpdate from './components/admin/userManagement/UserUpdate.jsx'
import SellerManagement from './components/admin/sellerManagement/SellerManagement.jsx'
import UpdateSeller from './components/admin/sellerManagement/UpdateSeller.jsx'
import AddSeller from './components/admin/sellerManagement/AddSeller.jsx'
import SellerLayout from './routes/SellerLayout.jsx'
import SellerDashboard from './components/seller/Dashboard.jsx'
import SellerMovieManagement from './components/seller/movieManagement/MovieManagement.jsx'
import UploadMovieForSeller from './components/seller/movieManagement/UploadMovieForSeller.jsx'
import UpdateMovieForSeller from './components/seller/movieManagement/UpdateMovieForSeller.jsx'
import WatchMovie from './components/user/WatchMovie.jsx'
import UserLayout from './routes/UserLayout.jsx'
import BrowseMovies from './components/seller/movieManagement/BrowseMovies.jsx'
import ApproveMovies from './components/admin/sellerManagement/ApproveMovies.jsx'
import SubscriptionManagement from './components/admin/subscriptionManagement/SubscriptionManagement.jsx'
import AddSubscription from './components/admin/subscriptionManagement/AddSubscription.jsx'
import UpdateSubscription from './components/admin/subscriptionManagement/UpdateSubscription.jsx'
import WatchHistory from './components/user/watchHistory/WatchHistory.jsx'
import UpdateDeleteSeller from './components/seller/sellerManagement/UpdateDeleteSeller.jsx'
import SearchMovie from './components/user/SearchMovie.jsx'
import Watchlist from './components/user/Watchlist.jsx'
import TermsAndConditions from './components/TermsAndConditions.jsx'
import Logout from './components/Logout.jsx'
import UserSubscriptionManagement from './components/user/subscriptionManagement/ViewAllSubscriptions.jsx'
import CheckoutForm from './components/user/subscriptionManagement/CheckoutForm.jsx'
import ViewSubscriptionHistory from './components/user/subscriptionManagement/ViewSubscriptionHistory.jsx'
import CardDetailsForm from './components/seller/sellerManagement/CardDetailsForm.jsx'
import AdminManagement from './components/admin/AdminManagement.jsx'
import UserAccountManagement from './components/user/UserAccountManagement.jsx'
import SellerAccountManagement from './components/seller/SellerAccountManagement.jsx'
import { loadThemeMode } from './services/profile/ProfileService.js'
import UserNotifications from './components/user/notifications/UserNotifications.jsx'
import PersonsManagement from './components/seller/personsManagement/PersonsManagement.jsx'

loadThemeMode()

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/'> 
      <Route index element={<Login />} />
      <Route path='login' element={<Login />} />
      <Route path='logout' element={<Logout />} />
      <Route path='signup' element={<Signup />} /> 
      <Route path='termsAndConditions' element={<TermsAndConditions />} /> 
      {/* User */}
      <Route path='userDashboard' element = {<UserLayout Children={<UserDashboard/>}/>}/>
      <Route path='user/search' element = {<UserLayout Children={<SearchMovie/>}/>}/>
      <Route path='user/watchlist' element = {<UserLayout Children={<Watchlist/>}/>}/>
      <Route path='user/history' element = {<UserLayout Children={<WatchHistory/>}/>}/>
      <Route path='watchMovie' element = {<UserLayout Children={<WatchMovie/>}/>}/>
      <Route path='user/subscription' element = {<UserLayout Children={<UserSubscriptionManagement/>}/>}/>
      <Route path='user/addSubscription' element = {<UserLayout Children={<CheckoutForm/>}/>}/>
      <Route path='user/subscriptionHistory' element = {<UserLayout Children={<ViewSubscriptionHistory/>}/>}/>
      <Route path='user/management' element = {<UserLayout Children={<UserAccountManagement/>}/>}/>
      <Route path='user/notifications' element = {<UserLayout Children={<UserNotifications/>}/>}/>

      {/* Admin */}
      <Route path='admin/adminDashboard' element = {<AdminLayout Children={<Dashboard/>}/>}/>
      <Route path='admin/movieManagement' element = {<AdminLayout Children={<MovieManagement/>}/>}/>
      <Route path='admin/userManagement' element = {<AdminLayout Children={<UserManagement/>}/>}/>
      <Route path='admin/user/add' element = {<AdminLayout Children={<AddUser/>}/>}/>
      <Route path='admin/user/update' element = {<AdminLayout Children={<UserUpdate/>}/>}/>
      <Route path='admin/sellerManagement' element = {<AdminLayout Children={<SellerManagement/>}/>}/>
      <Route path='admin/seller/add' element = {<AdminLayout Children={<AddSeller/>}/>}/>
      <Route path='admin/seller/update' element = {<AdminLayout Children={<UpdateSeller/>}/>}/>
      <Route path='admin/seller/approveMovies' element = {<AdminLayout Children={<ApproveMovies/>}/>}/>
      <Route path='admin/subscriptionManagement' element = {<AdminLayout Children={<SubscriptionManagement/>}/>}/>
      <Route path='subscription/add' element = {<AdminLayout Children={<AddSubscription/>}/>}/>
      <Route path='subscription/update' element = {<AdminLayout Children={<UpdateSubscription/>}/>}/>
      <Route path='admin/management' element = {<AdminLayout Children={<AdminManagement/>}/>}/>
      <Route path='admin/notifications' element = {<AdminLayout Children={<UserNotifications/>}/>}/>

      {/* Seller */}
      <Route path='seller/dashboard' element = {<SellerLayout Children={<SellerDashboard/>}/>}/>
      <Route path='seller/MovieManagement' element = {<SellerLayout Children={<SellerMovieManagement/>}/>}/>
      <Route path='seller/movie/upload' element = {<SellerLayout Children={<UploadMovieForSeller/>}/>}/>
      <Route path='seller/movie/update' element = {<SellerLayout Children={<UpdateMovieForSeller/>}/>}/>
      <Route path='seller/browseMovies' element = {<SellerLayout Children={<BrowseMovies/>}/>}/>
      <Route path='seller/accountManagement' element = {<SellerLayout Children={<UpdateDeleteSeller/>}/>}/>
      <Route path='seller/cardDetails' element = {<SellerLayout Children={<CardDetailsForm/>}/>}/>
      <Route path='seller/management' element = {<SellerLayout Children={<SellerAccountManagement/>}/>}/>
      <Route path='seller/persons' element = {<SellerLayout Children={<PersonsManagement/>}/>}/>
      <Route path='seller/notifications' element = {<SellerLayout Children={<UserNotifications/>}/>}/>
     
      
     
  </Route>
  )
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router}/>
  </StrictMode>,
)
