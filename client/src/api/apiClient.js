import axios from 'axios'
import toast from 'react-hot-toast'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 4000,
})

// ── In-Memory Mock Store for Seamless Offline Demo / Portfolio Preview ─────────
const mockStore = {
  user: {
    id: 1,
    name: 'Super Admin',
    email: 'admin@vortex26.com',
    role: 'SUPER_ADMIN',
  },
  attendees: [
    {
      id: 1,
      registrationId: 'VTX-2026-0001',
      qrCode: 'QR-VTX-0001-A7K9',
      fullName: 'Arjun Sharma',
      email: 'arjun.sharma@srm.edu.in',
      phone: '9876543210',
      college: 'SRM Institute of Science and Technology',
      registrationType: 'PRE_REGISTERED',
      workshops: ['AI & ML Workshop', 'Cloud Computing Bootcamp'],
      competitions: ['Hackathon 48hr', 'Coding Contest'],
      checkedIn: false,
      checkedInAt: null,
      checkedInGate: null,
      housingRequired: true,
      createdAt: '2026-10-30T10:00:00Z',
    },
    {
      id: 2,
      registrationId: 'VTX-2026-0002',
      qrCode: 'QR-VTX-0002-B3M5',
      fullName: 'Priya Krishnan',
      email: 'priya.k@vit.ac.in',
      phone: '9765432109',
      college: 'VIT Vellore',
      registrationType: 'PRE_REGISTERED',
      workshops: ['Web Dev Masterclass'],
      competitions: ['UI/UX Design Challenge'],
      checkedIn: true,
      checkedInAt: '2026-10-30T09:15:00Z',
      checkedInGate: 'Main Gate',
      housingRequired: true,
      createdAt: '2026-10-30T10:05:00Z',
    },
    {
      id: 3,
      registrationId: 'VTX-2026-0003',
      qrCode: 'QR-VTX-0003-C6N2',
      fullName: 'Rahul Mehta',
      email: 'rahul.mehta@iit.ac.in',
      phone: '9654321098',
      college: 'IIT Madras',
      registrationType: 'PRE_REGISTERED',
      workshops: ['Cybersecurity Essentials', 'AI & ML Workshop'],
      competitions: ['CTF Challenge'],
      checkedIn: false,
      checkedInAt: null,
      checkedInGate: null,
      housingRequired: false,
      createdAt: '2026-10-30T10:10:00Z',
    },
    {
      id: 4,
      registrationId: 'VTX-2026-0004',
      qrCode: 'QR-VTX-0004-D1P8',
      fullName: 'Sneha Patel',
      email: 'sneha.patel@bits.ac.in',
      phone: '9543210987',
      college: 'BITS Pilani',
      registrationType: 'PRE_REGISTERED',
      workshops: ['Cloud Computing Bootcamp'],
      competitions: ['Startup Pitch'],
      checkedIn: true,
      checkedInAt: '2026-10-30T09:30:00Z',
      checkedInGate: 'Gate A - North',
      housingRequired: true,
      createdAt: '2026-10-30T10:15:00Z',
    },
    {
      id: 5,
      registrationId: 'VTX-2026-0005',
      qrCode: 'QR-VTX-0005-E4Q3',
      fullName: 'Karthik Rajan',
      email: 'karthik.r@nit.ac.in',
      phone: '9432109876',
      college: 'NIT Trichy',
      registrationType: 'PRE_REGISTERED',
      workshops: ['Robotics & IoT Lab'],
      competitions: ['Robo Wars', 'Coding Contest'],
      checkedIn: false,
      checkedInAt: null,
      checkedInGate: null,
      housingRequired: true,
      createdAt: '2026-10-30T10:20:00Z',
    },
  ],
  housingBlocks: [
    {
      id: 1,
      blockName: 'Hostel Garnet A (Boys)',
      blockType: 'BOYS',
      totalCapacity: 120,
      occupiedBeds: 45,
      availableBeds: 75,
      rooms: [
        { id: 101, roomNumber: 'GA-101', capacity: 4, occupied: 3, isFull: false },
        { id: 102, roomNumber: 'GA-102', capacity: 4, occupied: 2, isFull: false },
        { id: 103, roomNumber: 'GA-103', capacity: 4, occupied: 4, isFull: true },
        { id: 104, roomNumber: 'GA-104', capacity: 4, occupied: 0, isFull: false },
        { id: 105, roomNumber: 'GA-105', capacity: 4, occupied: 4, isFull: true },
        { id: 106, roomNumber: 'GA-106', capacity: 4, occupied: 2, isFull: false },
        { id: 107, roomNumber: 'GA-107', capacity: 4, occupied: 1, isFull: false },
        { id: 108, roomNumber: 'GA-108', capacity: 4, occupied: 3, isFull: false },
        { id: 109, roomNumber: 'GA-109', capacity: 4, occupied: 4, isFull: true },
        { id: 110, roomNumber: 'GA-110', capacity: 4, occupied: 0, isFull: false },
      ],
    },
    {
      id: 2,
      blockName: 'Hostel Opal C (Girls)',
      blockType: 'GIRLS',
      totalCapacity: 120,
      occupiedBeds: 55,
      availableBeds: 65,
      rooms: [
        { id: 201, roomNumber: 'OC-101', capacity: 4, occupied: 4, isFull: true },
        { id: 202, roomNumber: 'OC-102', capacity: 4, occupied: 3, isFull: false },
        { id: 203, roomNumber: 'OC-103', capacity: 4, occupied: 2, isFull: false },
        { id: 204, roomNumber: 'OC-104', capacity: 4, occupied: 4, isFull: true },
        { id: 205, roomNumber: 'OC-105', capacity: 4, occupied: 0, isFull: false },
        { id: 206, roomNumber: 'OC-106', capacity: 4, occupied: 4, isFull: true },
        { id: 207, roomNumber: 'OC-107', capacity: 4, occupied: 2, isFull: false },
        { id: 208, roomNumber: 'OC-108', capacity: 4, occupied: 3, isFull: false },
        { id: 209, roomNumber: 'OC-109', capacity: 4, occupied: 1, isFull: false },
        { id: 210, roomNumber: 'OC-110', capacity: 4, occupied: 0, isFull: false },
      ],
    },
    {
      id: 3,
      blockName: 'VIP Guest House',
      blockType: 'VIP',
      totalCapacity: 20,
      occupiedBeds: 4,
      availableBeds: 16,
      rooms: [
        { id: 301, roomNumber: 'VIP-101', capacity: 2, occupied: 2, isFull: true },
        { id: 302, roomNumber: 'VIP-102', capacity: 2, occupied: 1, isFull: false },
        { id: 303, roomNumber: 'VIP-103', capacity: 2, occupied: 1, isFull: false },
        { id: 304, roomNumber: 'VIP-104', capacity: 2, occupied: 0, isFull: false },
      ],
    },
  ],
  allocations: [
    {
      id: 1,
      attendeeId: 1,
      attendeeName: 'Arjun Sharma',
      registrationId: 'VTX-2026-0001',
      blockName: 'Hostel Garnet A (Boys)',
      blockType: 'BOYS',
      roomNumber: 'GA-101',
      checkedIn: true,
      checkedOut: false,
      allocatedAt: '2026-10-30T09:00:00Z',
    },
    {
      id: 2,
      attendeeId: 2,
      attendeeName: 'Priya Krishnan',
      registrationId: 'VTX-2026-0002',
      blockName: 'Hostel Opal C (Girls)',
      blockType: 'GIRLS',
      roomNumber: 'OC-101',
      checkedIn: true,
      checkedOut: false,
      allocatedAt: '2026-10-30T09:10:00Z',
    },
  ],
}

// ── Request Interceptor — inject JWT token ────────────────────────────────────
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('vortex_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response Interceptor — centralized error handling ─────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status

    if (status === 401) {
      localStorage.removeItem('vortex_token')
      localStorage.removeItem('vortex_user')
      window.location.href = '/login'
      toast.error('Session expired. Please log in again.')
    } else if (status === 403) {
      toast.error('Access denied. Insufficient permissions.')
    }

    return Promise.reject(error)
  }
)

// ── API Functions with Intelligent Fallback for Offline / Demo Preview ────────
export const authApi = {
  login: async (data) => {
    try {
      return await apiClient.post('/auth/login', data)
    } catch (err) {
      // If backend is offline, proxy fails (500/502/504), network error, or ECONNREFUSED:
      const isBackendUnreachable =
        !err.response ||
        err.response.status === 502 ||
        err.response.status === 503 ||
        err.response.status === 504 ||
        (err.response.status === 500 && !err.response.data?.fieldErrors)

      if (isBackendUnreachable) {
        // Match demo accounts
        const email = data.email.toLowerCase()
        const role = email.includes('gate')
          ? 'GATE_STAFF'
          : email.includes('housing')
          ? 'HOUSING_STAFF'
          : email.includes('reg')
          ? 'REGISTRATION_STAFF'
          : 'SUPER_ADMIN'

        const demoUser = {
          id: 1,
          name: role === 'SUPER_ADMIN' ? 'Super Admin' : role.replace('_', ' '),
          email: data.email,
          role,
        }
        return {
          data: {
            token: 'demo-jwt-token-' + Date.now(),
            user: demoUser,
          },
        }
      }
      throw err
    }
  },
  register: (data) => apiClient.post('/auth/register', data),
  getProfile: () => apiClient.get('/auth/me'),
}

const isUnreachable = (err) =>
  !err.response ||
  err.response.status === 500 ||
  err.response.status === 502 ||
  err.response.status === 503 ||
  err.response.status === 504 ||
  err.code === 'ECONNABORTED' ||
  err.code === 'ERR_NETWORK'

export const attendeeApi = {
  getAll: async (params = {}) => {
    try {
      return await apiClient.get('/attendees', { params })
    } catch (err) {
      if (isUnreachable(err)) {
        let list = [...mockStore.attendees]
        if (params.search) {
          const s = params.search.toLowerCase()
          list = list.filter(
            (a) =>
              a.fullName.toLowerCase().includes(s) ||
              a.email.toLowerCase().includes(s) ||
              a.registrationId.toLowerCase().includes(s) ||
              a.college.toLowerCase().includes(s)
          )
        }
        if (params.type) {
          list = list.filter((a) => a.registrationType === params.type)
        }
        if (params.checkedIn !== undefined) {
          list = list.filter((a) => a.checkedIn === params.checkedIn)
        }
        return {
          data: {
            data: list,
            page: params.page || 0,
            size: params.size || 15,
            totalElements: list.length,
            totalPages: 1,
          },
        }
      }
      throw err
    }
  },
  getById: (id) => apiClient.get(`/attendees/${id}`),
  search: (q) => apiClient.get('/attendees/search', { params: { q } }),
  registerWalkIn: async (data) => {
    try {
      return await apiClient.post('/attendees/walk-in', data)
    } catch (err) {
      if (isUnreachable(err)) {
        const newAttendee = {
          id: Date.now(),
          registrationId: `VTX-2026-${(mockStore.attendees.length + 1)
            .toString()
            .padStart(4, '0')}`,
          qrCode: `QR-VTX-${Date.now().toString().slice(-4)}-DEMO`,
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          college: data.college,
          registrationType: 'WALK_IN',
          workshops: data.workshops || [],
          competitions: data.competitions || [],
          checkedIn: false,
          checkedInAt: null,
          checkedInGate: null,
          housingRequired: !!data.housingRequired,
          paymentMode: data.paymentMode || 'CASH',
          amountPaid: data.amountPaid || null,
          createdAt: new Date().toISOString(),
        }
        mockStore.attendees.unshift(newAttendee)
        return { data: newAttendee }
      }
      throw err
    }
  },
  checkIn: async (data) => {
    try {
      return await apiClient.post('/attendees/check-in', data)
    } catch (err) {
      if (isUnreachable(err)) {
        const query = data.query.trim().toLowerCase()
        const attendee = mockStore.attendees.find(
          (a) =>
            a.registrationId.toLowerCase() === query ||
            a.qrCode.toLowerCase() === query ||
            a.email.toLowerCase() === query
        )
        if (!attendee) {
          const notFoundError = new Error('Attendee not found')
          notFoundError.response = { data: { message: `No attendee found matching "${data.query}"` } }
          throw notFoundError
        }
        if (attendee.checkedIn) {
          return {
            data: {
              success: false,
              message: `⚠️ Already checked in at ${attendee.checkedInAt} via ${attendee.checkedInGate}`,
              attendee,
              alreadyCheckedIn: true,
            },
          }
        }
        attendee.checkedIn = true
        attendee.checkedInAt = new Date().toISOString()
        attendee.checkedInGate = data.gateLocation || 'Main Gate'
        return {
          data: {
            success: true,
            message: `✅ Welcome, ${attendee.fullName}! Gate admission verified.`,
            attendee,
          },
        }
      }
      throw err
    }
  },
}

export const dashboardApi = {
  getStats: async () => {
    try {
      return await apiClient.get('/dashboard/stats')
    } catch (err) {
      if (isUnreachable(err)) {
        const total = mockStore.attendees.length
        const checkedIn = mockStore.attendees.filter((a) => a.checkedIn).length
        const preRegistered = mockStore.attendees.filter((a) => a.registrationType === 'PRE_REGISTERED').length
        const walkIns = mockStore.attendees.filter((a) => a.registrationType === 'WALK_IN').length
        const housingReq = mockStore.attendees.filter((a) => a.housingRequired).length

        return {
          data: {
            totalAttendees: total,
            preRegistered,
            walkIns,
            checkedIn,
            pendingEntry: total - checkedIn,
            housingRequired: housingReq,
            housingAllocated: 2,
            checkInPercentage: total > 0 ? (checkedIn / total) * 100 : 0,
            workshopStats: {
              'AI & ML Workshop': 18,
              'Web Dev Masterclass': 14,
              'Cloud Computing Bootcamp': 12,
              'Cybersecurity Essentials': 9,
              'Robotics & IoT Lab': 8,
              'UI/UX Design': 7,
            },
            competitionStats: {
              'Hackathon 48hr': 22,
              'Coding Contest': 19,
              'Robo Wars': 11,
              'CTF Challenge': 10,
              'UI/UX Design Challenge': 8,
            },
            blockOccupancy: mockStore.housingBlocks.map((b) => ({
              blockName: b.blockName,
              blockType: b.blockType,
              totalCapacity: b.totalCapacity,
              occupiedBeds: b.occupiedBeds,
              availableBeds: b.availableBeds,
              occupancyPercentage: (b.occupiedBeds / b.totalCapacity) * 100,
            })),
          },
        }
      }
      throw err
    }
  },
}

export const housingApi = {
  getBlocks: async () => {
    try {
      return await apiClient.get('/housing/blocks')
    } catch (err) {
      if (isUnreachable(err)) {
        return { data: mockStore.housingBlocks }
      }
      throw err
    }
  },
  getAllocations: async () => {
    try {
      return await apiClient.get('/housing/allocations')
    } catch (err) {
      if (isUnreachable(err)) {
        return { data: mockStore.allocations || [] }
      }
      throw err
    }
  },
  allocate: async (data) => {
    try {
      return await apiClient.post('/housing/allocate', data)
    } catch (err) {
      if (isUnreachable(err)) {
        // Find attendee and room
        const attendee = mockStore.attendees.find((a) => a.id === Number(data.attendeeId))
        let targetBlock = null
        let targetRoom = null

        for (const block of mockStore.housingBlocks) {
          const room = block.rooms.find((r) => r.id === Number(data.roomId))
          if (room) {
            targetBlock = block
            targetRoom = room
            break
          }
        }

        if (!targetRoom || targetRoom.isFull) {
          const errFull = new Error('Room is full or does not exist')
          errFull.response = { data: { message: 'Selected room is already at full capacity' } }
          throw errFull
        }

        // Increment occupancy
        targetRoom.occupied += 1
        targetRoom.isFull = targetRoom.occupied >= targetRoom.capacity
        targetBlock.occupiedBeds += 1
        targetBlock.availableBeds = targetBlock.totalCapacity - targetBlock.occupiedBeds

        const newAlloc = {
          id: Date.now(),
          attendeeId: attendee ? attendee.id : Number(data.attendeeId),
          attendeeName: attendee ? attendee.fullName : 'Attendee #' + data.attendeeId,
          registrationId: attendee ? attendee.registrationId : 'VTX-2026-X',
          blockName: targetBlock.blockName,
          blockType: targetBlock.blockType,
          roomNumber: targetRoom.roomNumber,
          checkedIn: false,
          checkedOut: false,
          allocatedAt: new Date().toISOString(),
        }

        if (!mockStore.allocations) mockStore.allocations = []
        mockStore.allocations.unshift(newAlloc)

        return { data: newAlloc }
      }
      throw err
    }
  },
  getByAttendee: (id) => apiClient.get(`/housing/attendee/${id}`),
  roomCheckIn: async (id) => {
    try {
      return await apiClient.patch(`/housing/allocations/${id}/check-in`)
    } catch (err) {
      if (isUnreachable(err)) {
        const alloc = (mockStore.allocations || []).find((a) => a.id === Number(id))
        if (alloc) {
          alloc.checkedIn = true
          alloc.checkedInAt = new Date().toISOString()
        }
        return { data: alloc }
      }
      throw err
    }
  },
  roomCheckOut: async (id) => {
    try {
      return await apiClient.patch(`/housing/allocations/${id}/check-out`)
    } catch (err) {
      if (isUnreachable(err)) {
        const alloc = (mockStore.allocations || []).find((a) => a.id === Number(id))
        if (alloc && !alloc.checkedOut) {
          alloc.checkedOut = true
          alloc.checkedOutAt = new Date().toISOString()
          // release bed
          for (const block of mockStore.housingBlocks) {
            const room = block.rooms.find((r) => r.roomNumber === alloc.roomNumber)
            if (room && room.occupied > 0) {
              room.occupied -= 1
              room.isFull = false
              block.occupiedBeds = Math.max(0, block.occupiedBeds - 1)
              block.availableBeds = block.totalCapacity - block.occupiedBeds
              break
            }
          }
        }
        return { data: alloc }
      }
      throw err
    }
  },
}

export default apiClient
