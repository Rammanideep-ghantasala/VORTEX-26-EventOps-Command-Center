import axios from 'axios'
import toast from 'react-hot-toast'

const API_BASE = import.meta.env.VITE_API_URL || '/api'
export const demoModeEnabled = import.meta.env.VITE_ENABLE_DEMO_MODE === 'true'

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 5000,
})

// ── In-Memory Mock Store for Seamless Offline Demo / Portfolio Preview ─────────
const initialMockStore = {
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
      gender: 'MALE',
      department: 'Computer Science & Engineering',
      yearOfStudy: '3rd Year',
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
      gender: 'FEMALE',
      department: 'Electronics & Communication',
      yearOfStudy: '4th Year',
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
      gender: 'MALE',
      department: 'Information Technology',
      yearOfStudy: '2nd Year',
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
      gender: 'FEMALE',
      department: 'Computer Science',
      yearOfStudy: '3rd Year',
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
      gender: 'MALE',
      department: 'Mechanical Engineering',
      yearOfStudy: '4th Year',
      registrationType: 'PRE_REGISTERED',
      workshops: ['Robotics & IoT Lab'],
      competitions: ['Robo Wars', 'Coding Contest'],
      checkedIn: false,
      checkedInAt: null,
      checkedInGate: null,
      housingRequired: true,
      createdAt: '2026-10-30T10:20:00Z',
    },
    {
      id: 6,
      registrationId: 'VTX-2026-0006',
      qrCode: 'QR-VTX-0006-F7R1',
      fullName: 'Taylor Swift (Unspecified Gender)',
      email: 'taylor@guest.edu',
      phone: '9123456780',
      college: 'Global University',
      gender: null, // Test case: missing gender requires manual review
      department: 'Arts & Media',
      yearOfStudy: '1st Year',
      registrationType: 'PRE_REGISTERED',
      workshops: ['UI/UX Design'],
      competitions: ['UI/UX Design Challenge'],
      checkedIn: false,
      checkedInAt: null,
      checkedInGate: null,
      housingRequired: true,
      createdAt: '2026-10-30T10:25:00Z',
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
      fromDate: '2026-10-30',
      toDate: '2026-11-02',
      status: 'CHECKED_IN',
      checkedIn: true,
      checkedInAt: '2026-10-30T10:00:00Z',
      checkedOut: false,
      checkedOutAt: null,
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
      fromDate: '2026-10-30',
      toDate: '2026-11-02',
      status: 'CHECKED_IN',
      checkedIn: true,
      checkedInAt: '2026-10-30T09:30:00Z',
      checkedOut: false,
      checkedOutAt: null,
      allocatedAt: '2026-10-30T09:10:00Z',
    },
    {
      id: 3,
      attendeeId: 4,
      attendeeName: 'Sneha Patel',
      registrationId: 'VTX-2026-0004',
      blockName: 'Hostel Opal C (Girls)',
      blockType: 'GIRLS',
      roomNumber: 'OC-102',
      fromDate: '2026-10-30',
      toDate: '2026-11-01',
      status: 'ALLOCATED',
      checkedIn: false,
      checkedInAt: null,
      checkedOut: false,
      checkedOutAt: null,
      allocatedAt: '2026-10-30T09:40:00Z',
    },
  ],
  workshops: [
    {
      id: 1,
      name: 'AI & ML Workshop',
      code: 'WS-AIML',
      description: 'Deep Learning, LLMs & Model Deployment with PyTorch',
      capacity: 100,
      instructor: 'Dr. Rajiv Menon',
      venue: 'Auditorium Hall A',
    },
    {
      id: 2,
      name: 'Web Dev Masterclass',
      code: 'WS-WEB',
      description: 'Full-Stack Modern Web Engineering with React 19 & Spring Boot',
      capacity: 50,
      instructor: 'Ananya Roy',
      venue: 'Lab 3 - IT Block',
    },
    {
      id: 3,
      name: 'Cybersecurity Essentials',
      code: 'WS-SEC',
      description: 'Ethical Hacking, Network Security & Incident Defense',
      capacity: 30,
      instructor: 'Karan Malhotra',
      venue: 'Cyber Defense Lab',
    },
    {
      id: 4,
      name: 'Cloud Computing Bootcamp',
      code: 'WS-CLOUD',
      description: 'AWS Microservices, Kubernetes, and Serverless Infrastructure',
      capacity: 40,
      instructor: 'Sneha Deshmukh',
      venue: 'Seminar Hall 2',
    },
    {
      id: 5,
      name: 'Robotics & IoT Lab',
      code: 'WS-ROBO',
      description: 'Embedded Systems, Sensors, Arduino & Autonomous Hardware',
      capacity: 25,
      instructor: 'Prof. R. Sundaram',
      venue: 'Robotics Innovation Center',
    },
    {
      id: 6,
      name: 'UI/UX Design',
      code: 'WS-UIUX',
      description: 'Design Systems, Figma Wireframing, and Micro-interactions',
      capacity: 35,
      instructor: 'Tara Varma',
      venue: 'Design Studio B',
    },
  ],
  workshopRegistrations: [
    { id: 1, workshopId: 1, attendeeId: 1, status: 'CONFIRMED', registeredAt: '2026-10-30T10:00:00Z' },
    { id: 2, workshopId: 4, attendeeId: 1, status: 'CONFIRMED', registeredAt: '2026-10-30T10:00:00Z' },
    { id: 3, workshopId: 2, attendeeId: 2, status: 'CONFIRMED', registeredAt: '2026-10-30T10:05:00Z' },
    { id: 4, workshopId: 3, attendeeId: 3, status: 'CONFIRMED', registeredAt: '2026-10-30T10:10:00Z' },
    { id: 5, workshopId: 1, attendeeId: 3, status: 'CONFIRMED', registeredAt: '2026-10-30T10:10:00Z' },
    { id: 6, workshopId: 4, attendeeId: 4, status: 'CONFIRMED', registeredAt: '2026-10-30T10:15:00Z' },
    { id: 7, workshopId: 5, attendeeId: 5, status: 'CONFIRMED', registeredAt: '2026-10-30T10:20:00Z' },
  ],
}

const STORAGE_KEY = 'vortex26_mock_store_v1'
const loadStore = () => {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && Array.isArray(parsed.attendees)) {
        return parsed
      }
    }
  } catch (e) {
    console.warn('Could not read mockStore from localStorage', e)
  }
  return JSON.parse(JSON.stringify(initialMockStore))
}

const mockStore = loadStore()

export const persistMockStore = () => {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockStore))
    }
  } catch (e) {
    console.warn('Could not persist mockStore', e)
  }
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

const isUnreachable = (err) =>
  demoModeEnabled && (
    !err.response ||
    err.response.status === 500 ||
    err.response.status === 502 ||
    err.response.status === 503 ||
    err.response.status === 504 ||
    err.code === 'ECONNABORTED' ||
    err.code === 'ERR_NETWORK'
  )

// ── Auth APIs ─────────────────────────────────────────────────────────────────
export const authApi = {
  login: async (data) => {
    try {
      return await apiClient.post('/auth/login', data)
    } catch (err) {
      if (isUnreachable(err)) {
        const email = data.email.toLowerCase()
        const role = email.includes('gate')
          ? 'GATE_STAFF'
          : email.includes('housing') || email.includes('accomm')
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

// ── Attendee APIs ─────────────────────────────────────────────────────────────
export const attendeeApi = {
  getAll: async (params = {}) => {
    try {
      const res = await apiClient.get('/attendees', { params })
      const payload = res.data
      const items = payload.content || payload.data || (Array.isArray(payload) ? payload : [])
      return {
        data: {
          data: items,
          content: items,
          page: payload.page ?? params.page ?? 0,
          size: payload.size ?? params.size ?? 15,
          totalElements: payload.totalElements ?? items.length,
          totalPages: payload.totalPages ?? 1,
        },
      }
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
            content: list,
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
  getProfile: async (id) => {
    try {
      return await apiClient.get(`/attendees/${id}/profile`)
    } catch (err) {
      if (isUnreachable(err)) {
        const attendee = mockStore.attendees.find((a) => a.id === Number(id))
        if (!attendee) {
          const e = new Error('Attendee not found')
          e.response = { data: { message: 'Attendee not found' } }
          throw e
        }
        const allocations = (mockStore.allocations || []).filter((al) => al.attendeeId === attendee.id)
        const currentAlloc = allocations.find((al) => al.status === 'ALLOCATED' || al.status === 'CHECKED_IN') || null

        const wsRegs = (mockStore.workshopRegistrations || [])
          .filter((wr) => wr.attendeeId === attendee.id)
          .map((wr) => {
            const ws = mockStore.workshops.find((w) => w.id === wr.workshopId)
            return {
              id: wr.id,
              workshopId: wr.workshopId,
              workshopName: ws ? ws.name : 'Workshop #' + wr.workshopId,
              workshopCode: ws ? ws.code : 'WS-00',
              status: wr.status,
              registeredAt: wr.registeredAt,
              attendanceStatus: attendee.checkedIn ? 'PRESENT' : 'REGISTERED',
            }
          })

        const evtRegs = (attendee.competitions || []).map((comp, idx) => ({
          id: idx + 1,
          eventName: comp,
          status: 'CONFIRMED',
          registeredAt: attendee.createdAt,
          attendanceStatus: attendee.checkedIn ? 'PRESENT' : 'REGISTERED',
        }))

        const gateLogs = attendee.checkedIn
          ? [
              {
                id: 1,
                action: 'CHECK_IN',
                gateLocation: attendee.checkedInGate || 'Main Gate',
                operatorName: 'Gate Officer',
                note: 'Verified entry ticket',
                loggedAt: attendee.checkedInAt || attendee.createdAt,
              },
            ]
          : []

        return {
          data: {
            personalInfo: attendee,
            currentAccommodation: currentAlloc,
            accommodationHistory: allocations,
            workshopRegistrations: wsRegs,
            totalWorkshops: wsRegs.length,
            eventRegistrations: evtRegs,
            totalEvents: evtRegs.length,
            gateLogs: gateLogs,
          },
        }
      }
      throw err
    }
  },
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
          gender: data.gender || 'MALE',
          department: data.department || 'Computer Science & Engineering',
          yearOfStudy: data.yearOfStudy || '3rd Year',
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
        persistMockStore()
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
        persistMockStore()
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

// ── Dashboard APIs ────────────────────────────────────────────────────────────
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
        const activeAllocs = (mockStore.allocations || []).filter(
          (al) => al.status === 'ALLOCATED' || al.status === 'CHECKED_IN'
        ).length

        return {
          data: {
            totalAttendees: total,
            preRegistered,
            walkIns,
            checkedIn,
            pendingEntry: total - checkedIn,
            housingRequired: housingReq,
            housingAllocated: activeAllocs,
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
              blockId: b.id,
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

// ── Accommodation (Previously Housing) APIs ───────────────────────────────────
export const housingApi = {
  getBlocks: async (gender) => {
    try {
      return await apiClient.get('/housing/blocks', { params: { gender } })
    } catch (err) {
      if (isUnreachable(err)) {
        let blocks = mockStore.housingBlocks
        if (gender === 'MALE') blocks = blocks.filter((b) => b.blockType === 'BOYS' || b.blockType === 'VIP')
        if (gender === 'FEMALE') blocks = blocks.filter((b) => b.blockType === 'GIRLS' || b.blockType === 'VIP')
        return { data: blocks }
      }
      throw err
    }
  },
  getDashboard: async () => {
    try {
      return await apiClient.get('/housing/dashboard')
    } catch (err) {
      if (isUnreachable(err)) {
        let totalRooms = 0
        let totalCapacity = 0
        let occupiedBeds = 0
        const roomOccupancy = []

        mockStore.housingBlocks.forEach((b) => {
          b.rooms.forEach((r) => {
            totalRooms++
            totalCapacity += r.capacity
            occupiedBeds += r.occupied
            roomOccupancy.push({
              roomId: r.id,
              roomNumber: r.roomNumber,
              blockName: b.blockName,
              blockType: b.blockType,
              capacity: r.capacity,
              occupied: r.occupied,
              availableBeds: Math.max(0, r.capacity - r.occupied),
              isFull: r.isFull,
            })
          })
        })

        const hostelOccupancy = mockStore.housingBlocks.map((b) => ({
          blockId: b.id,
          blockName: b.blockName,
          blockType: b.blockType,
          totalCapacity: b.totalCapacity,
          occupiedBeds: b.occupiedBeds,
          availableBeds: b.availableBeds,
          occupancyPercentage: (b.occupiedBeds / b.totalCapacity) * 100,
        }))

        const upcomingCheckIns = (mockStore.allocations || []).filter((al) => al.status === 'ALLOCATED')
        const upcomingCheckOuts = (mockStore.allocations || []).filter((al) => al.status === 'CHECKED_IN')

        return {
          data: {
            totalHostels: mockStore.housingBlocks.length,
            totalRooms,
            totalBedCapacity: totalCapacity,
            occupiedBeds,
            availableBeds: Math.max(0, totalCapacity - occupiedBeds),
            hostelOccupancy,
            roomOccupancy,
            upcomingCheckIns,
            upcomingCheckOuts,
          },
        }
      }
      throw err
    }
  },
  getAllocations: async (status) => {
    try {
      return await apiClient.get('/housing/allocations', { params: { status } })
    } catch (err) {
      if (isUnreachable(err)) {
        let list = mockStore.allocations || []
        if (status) list = list.filter((al) => al.status === status)
        return { data: list }
      }
      throw err
    }
  },
  allocate: async (data) => {
    try {
      return await apiClient.post('/housing/allocate', data)
    } catch (err) {
      if (isUnreachable(err)) {
        // Date validation
        if (!data.fromDate || !data.toDate) {
          const dErr = new Error('Both From Date and To Date are mandatory')
          dErr.response = { data: { message: 'Both From Date and To Date are mandatory' } }
          throw dErr
        }
        if (data.toDate < data.fromDate) {
          const dErr = new Error('To Date cannot be earlier than From Date')
          dErr.response = { data: { message: 'To Date cannot be earlier than From Date' } }
          throw dErr
        }

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

        // Gender validation
        if (attendee) {
          if (!attendee.gender && !data.manualGenderOverride) {
            const gErr = new Error('Attendee gender is missing. Manual review required.')
            gErr.response = { data: { message: 'Attendee gender is not specified in profile. Manual review is required.' } }
            throw gErr
          }
          if (attendee.gender === 'MALE' && targetBlock.blockType === 'GIRLS') {
            const gErr = new Error('Male attendee cannot be allocated to Girls Hostel')
            gErr.response = { data: { message: 'Gender mismatch: Male attendees cannot be allocated to Girls Hostel (Opal C).' } }
            throw gErr
          }
          if (attendee.gender === 'FEMALE' && targetBlock.blockType === 'BOYS') {
            const gErr = new Error('Female attendee cannot be allocated to Boys Hostel')
            gErr.response = { data: { message: 'Gender mismatch: Female attendees cannot be allocated to Boys Hostel (Garnet A).' } }
            throw gErr
          }
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
          fromDate: data.fromDate,
          toDate: data.toDate,
          status: 'ALLOCATED',
          checkedIn: false,
          checkedInAt: null,
          checkedOut: false,
          checkedOutAt: null,
          allocatedAt: new Date().toISOString(),
        }

        if (!mockStore.allocations) mockStore.allocations = []
        mockStore.allocations.unshift(newAlloc)
        persistMockStore()
        return { data: newAlloc }
      }
      throw err
    }
  },
  getByAttendee: (id) => apiClient.get(`/housing/attendee/${id}`),
  getHistory: (id) => apiClient.get(`/housing/history/${id}`),
  updateRoomCapacity: async (id, capacity) => {
    try {
      return await apiClient.patch(`/housing/rooms/${id}/capacity`, { capacity })
    } catch (err) {
      if (isUnreachable(err)) {
        if (capacity < 1 || capacity > 20) {
          const cErr = new Error('Capacity must be between 1 and 20')
          cErr.response = { data: { message: 'Room capacity must be between 1 and 20' } }
          throw cErr
        }
        for (const block of mockStore.housingBlocks) {
          const room = block.rooms.find((r) => r.id === Number(id))
          if (room) {
            if (capacity < room.occupied) {
              const cErr = new Error('Cannot reduce capacity below current occupied beds')
              cErr.response = { data: { message: `Cannot reduce room capacity to ${capacity}: Room has ${room.occupied} occupied beds.` } }
              throw cErr
            }
            block.totalCapacity += capacity - room.capacity
            room.capacity = capacity
            room.isFull = room.occupied >= room.capacity
            block.availableBeds = block.totalCapacity - block.occupiedBeds
            persistMockStore()
            return { data: room }
          }
        }
      }
      throw err
    }
  },
  roomCheckIn: async (id) => {
    try {
      return await apiClient.patch(`/housing/allocations/${id}/check-in`)
    } catch (err) {
      if (isUnreachable(err)) {
        const alloc = (mockStore.allocations || []).find((a) => a.id === Number(id))
        if (alloc) {
          alloc.checkedIn = true
          alloc.status = 'CHECKED_IN'
          alloc.checkedInAt = new Date().toISOString()
          persistMockStore()
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
        if (alloc && alloc.status !== 'CHECKED_OUT') {
          alloc.checkedOut = true
          alloc.status = 'CHECKED_OUT'
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
          persistMockStore()
        }
        return { data: alloc }
      }
      throw err
    }
  },
}

// Module alias for Accommodation (Section 1.1)
export const accommodationApi = housingApi

// ── Workshop Seat Capacity Management APIs ────────────────────────────────────
export const workshopsApi = {
  getAll: async () => {
    try {
      return await apiClient.get('/workshops')
    } catch (err) {
      if (isUnreachable(err)) {
        return {
          data: mockStore.workshops.map((w) => {
            const confirmedCount = (mockStore.workshopRegistrations || []).filter(
              (r) => r.workshopId === w.id && r.status === 'CONFIRMED'
            ).length
            const avail = Math.max(0, w.capacity - confirmedCount)
            const pct = (confirmedCount / w.capacity) * 100
            const status =
              confirmedCount >= w.capacity
                ? 'FULLY_BOOKED'
                : confirmedCount >= w.capacity * 0.8
                ? 'ALMOST_FULL'
                : 'AVAILABLE'

            return {
              ...w,
              registeredParticipants: confirmedCount,
              availableSeats: avail,
              occupancyPercentage: pct,
              status,
            }
          }),
        }
      }
      throw err
    }
  },
  getById: async (id) => {
    try {
      return await apiClient.get(`/workshops/${id}`)
    } catch (err) {
      if (isUnreachable(err)) {
        const w = mockStore.workshops.find((item) => item.id === Number(id))
        if (!w) {
          const e = new Error('Workshop not found')
          e.response = { data: { message: 'Workshop not found' } }
          throw e
        }
        const confirmedCount = (mockStore.workshopRegistrations || []).filter(
          (r) => r.workshopId === w.id && r.status === 'CONFIRMED'
        ).length
        return {
          data: {
            ...w,
            registeredParticipants: confirmedCount,
            availableSeats: Math.max(0, w.capacity - confirmedCount),
            occupancyPercentage: (confirmedCount / w.capacity) * 100,
            status: confirmedCount >= w.capacity ? 'FULLY_BOOKED' : 'AVAILABLE',
          },
        }
      }
      throw err
    }
  },
  create: async (data) => {
    try {
      return await apiClient.post('/workshops', data)
    } catch (err) {
      if (isUnreachable(err)) {
        if (data.capacity < 1 || data.capacity > 100) {
          const e = new Error('Capacity must be between 1 and 100')
          e.response = { data: { message: 'Workshop capacity must be between 1 and 100' } }
          throw e
        }
        const newWs = {
          id: Date.now(),
          name: data.name,
          code: data.code,
          description: data.description,
          capacity: Number(data.capacity) || 100,
          instructor: data.instructor || 'Industry Expert',
          venue: data.venue || 'Auditorium Hall',
          registeredParticipants: 0,
          availableSeats: Number(data.capacity) || 100,
          occupancyPercentage: 0,
          status: 'AVAILABLE',
        }
        mockStore.workshops.push(newWs)
        persistMockStore()
        return { data: newWs }
      }
      throw err
    }
  },
  updateCapacity: async (id, capacity) => {
    try {
      return await apiClient.put(`/workshops/${id}/capacity`, { capacity: Number(capacity) })
    } catch (err) {
      if (isUnreachable(err)) {
        const cap = Number(capacity)
        if (cap < 1 || cap > 100) {
          const e = new Error('Capacity must be between 1 and 100')
          e.response = { data: { message: 'Workshop capacity must be between 1 and 100 participants' } }
          throw e
        }
        const w = mockStore.workshops.find((item) => item.id === Number(id))
        if (!w) throw new Error('Workshop not found')

        const confirmedCount = (mockStore.workshopRegistrations || []).filter(
          (r) => r.workshopId === w.id && r.status === 'CONFIRMED'
        ).length

        if (cap < confirmedCount) {
          const e = new Error(`Cannot reduce capacity below confirmed count (${confirmedCount})`)
          e.response = {
            data: { message: `Cannot reduce capacity to ${cap}: There are already ${confirmedCount} confirmed participants.` },
          }
          throw e
        }
        w.capacity = cap
        persistMockStore()
        return {
          data: {
            ...w,
            registeredParticipants: confirmedCount,
            availableSeats: cap - confirmedCount,
            occupancyPercentage: (confirmedCount / cap) * 100,
            status: confirmedCount >= cap ? 'FULLY_BOOKED' : 'AVAILABLE',
          },
        }
      }
      throw err
    }
  },
  getParticipants: async (id, params = {}) => {
    try {
      return await apiClient.get(`/workshops/${id}/participants`, { params })
    } catch (err) {
      if (isUnreachable(err)) {
        const regs = (mockStore.workshopRegistrations || []).filter((r) => r.workshopId === Number(id))
        let participants = regs.map((r, idx) => {
          const att = mockStore.attendees.find((a) => a.id === r.attendeeId) || {
            fullName: 'Attendee #' + r.attendeeId,
            registrationId: 'VTX-2026-X',
            email: 'attendee@vortex.edu',
            phone: '9876543210',
            college: 'Symposium College',
          }
          return {
            serialNumber: idx + 1,
            registrationId: att.registrationId,
            fullName: att.fullName,
            email: att.email,
            phone: att.phone,
            college: att.college,
            registeredAt: r.registeredAt,
            status: r.status,
            attendeeId: r.attendeeId,
          }
        })

        if (params.search) {
          const s = params.search.toLowerCase()
          participants = participants.filter(
            (p) =>
              p.fullName.toLowerCase().includes(s) ||
              p.registrationId.toLowerCase().includes(s) ||
              p.email.toLowerCase().includes(s)
          )
        }
        if (params.status) {
          participants = participants.filter((p) => p.status === params.status)
        }

        return {
          data: {
            data: participants,
            page: 0,
            size: 20,
            totalElements: participants.length,
            totalPages: 1,
          },
        }
      }
      throw err
    }
  },
  exportCsv: async (id) => {
    try {
      return await apiClient.get(`/workshops/${id}/export`, { responseType: 'blob' })
    } catch (err) {
      if (isUnreachable(err)) {
        const regs = (mockStore.workshopRegistrations || []).filter(
          (r) => r.workshopId === Number(id) && r.status === 'CONFIRMED'
        )
        let csv = 'Serial Number,Registration ID,Full Name,Email,Phone,College,Registration Date,Status\n'
        regs.forEach((r, idx) => {
          const att = mockStore.attendees.find((a) => a.id === r.attendeeId) || {
            fullName: 'Attendee #' + r.attendeeId,
            registrationId: 'VTX-2026-X',
            email: 'attendee@vortex.edu',
            phone: '9876543210',
            college: 'Symposium College',
          }
          csv += `${idx + 1},"${att.registrationId}","${att.fullName}","${att.email}","${att.phone}","${att.college}","${r.registeredAt}","${r.status}"\n`
        })
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
        return { data: blob }
      }
      throw err
    }
  },
  registerParticipant: async (id, attendeeId) => {
    try {
      return await apiClient.post(`/workshops/${id}/register`, { attendeeId: Number(attendeeId) })
    } catch (err) {
      if (isUnreachable(err)) {
        const wId = Number(id)
        const aId = Number(attendeeId)
        const w = mockStore.workshops.find((item) => item.id === wId)
        if (!w) throw new Error('Workshop not found')

        // 1. Prevent duplicate registration
        const existing = (mockStore.workshopRegistrations || []).find(
          (r) => r.workshopId === wId && r.attendeeId === aId && r.status === 'CONFIRMED'
        )
        if (existing) {
          const e = new Error('Duplicate registration')
          e.response = { data: { message: 'Attendee is already registered for this workshop' } }
          throw e
        }

        // 2. Prevent overbooking
        const confirmedCount = (mockStore.workshopRegistrations || []).filter(
          (r) => r.workshopId === wId && r.status === 'CONFIRMED'
        ).length
        if (confirmedCount >= w.capacity) {
          const e = new Error('Overbooked')
          e.response = {
            data: { message: 'Sorry, this workshop is fully booked. No seats are currently available.' },
          }
          throw e
        }

        const newReg = {
          id: Date.now(),
          workshopId: wId,
          attendeeId: aId,
          status: 'CONFIRMED',
          registeredAt: new Date().toISOString(),
        }
        if (!mockStore.workshopRegistrations) mockStore.workshopRegistrations = []
        mockStore.workshopRegistrations.push(newReg)
        persistMockStore()

        const att = mockStore.attendees.find((a) => a.id === aId)
        return {
          data: {
            serialNumber: confirmedCount + 1,
            registrationId: att ? att.registrationId : 'VTX-2026-X',
            fullName: att ? att.fullName : 'Participant',
            email: att ? att.email : '',
            phone: att ? att.phone : '',
            college: att ? att.college : '',
            registeredAt: newReg.registeredAt,
            status: 'CONFIRMED',
          },
        }
      }
      throw err
    }
  },
  cancelRegistration: async (id, attendeeId) => {
    try {
      return await apiClient.post(`/workshops/${id}/cancel`, { attendeeId: Number(attendeeId) })
    } catch (err) {
      if (isUnreachable(err)) {
        const reg = (mockStore.workshopRegistrations || []).find(
          (r) => r.workshopId === Number(id) && r.attendeeId === Number(attendeeId) && r.status === 'CONFIRMED'
        )
        if (reg) {
          reg.status = 'CANCELLED'
          reg.cancelledAt = new Date().toISOString()
          persistMockStore()
        }
        return { data: reg }
      }
      throw err
    }
  },
}

export default apiClient
