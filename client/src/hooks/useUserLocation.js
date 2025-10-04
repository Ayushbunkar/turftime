// "use client"

// import { useState, useEffect } from "react"

// export const useUserLocation = () => {
//   const [userLocation, setUserLocation] = useState({ lat: 28.6139, lng: 77.209 })

//   useEffect(() => {
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           setUserLocation({
//             lat: position.coords.latitude,
//             lng: position.coords.longitude,
//           })
//         },
//         (error) => {
//           console.log("Location access denied")
//         },
//       )
//     }
//   }, [])

//   return userLocation
// }
