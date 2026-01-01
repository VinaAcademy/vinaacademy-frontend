import ExcelJS from 'exceljs'
import {
  PlatformStats,
  RevenueOverview,
  ActiveUsers,
  RecentActivities,
} from '@/services/adminDashboardService'

// Professional color palette
const colors = {
  primary: 'FF2563EB', // Modern blue
  secondary: 'FF7C3AED', // Purple
  success: 'FF10B981', // Green
  danger: 'FFEF4444', // Red
  warning: 'FFF59E0B', // Amber
  info: 'FF06B6D4', // Cyan
  dark: 'FF1E293B', // Slate
  light: 'FFF8FAFC', // Very light gray
  accent: 'FFEC4899', // Pink
}

// Premium styling helpers
function applyHeaderStyle(row: ExcelJS.Row) {
  row.height = 35
  row.eachCell((cell) => {
    cell.font = {
      bold: true,
      size: 11,
      color: { argb: 'FFFFFFFF' },
      name: 'Segoe UI',
    }
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: colors.dark },
    }
    cell.alignment = { horizontal: 'center', vertical: 'middle' }
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    }
  })
}

function applyAlternatingRows(
  sheet: ExcelJS.Worksheet,
  startRow: number,
  endRow: number,
) {
  for (let i = startRow; i <= endRow; i++) {
    const row = sheet.getRow(i)
    if (i % 2 === 0) {
      row.eachCell((cell) => {
        if (!cell.fill || (cell.fill as any).fgColor?.argb !== colors.dark) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF8FAFC' },
          }
        }
      })
    }
    row.eachCell((cell) => {
      if (!cell.font) cell.font = { name: 'Segoe UI' }
      cell.alignment = { vertical: 'middle' }
    })
  }
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value)
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('vi-VN')
}

function formatPercentage(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
}

export interface AdminDashboardExportData {
  platformStats: PlatformStats
  revenueOverview: RevenueOverview
  activeUsers: ActiveUsers
  recentActivities: RecentActivities
}

export async function exportAdminDashboardToExcel(
  data: AdminDashboardExportData,
  timeRange: string,
) {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'VinaAcademy Admin'
  workbook.created = new Date()

  // 1. Platform Statistics Sheet - Premium Design
  const statsSheet = workbook.addWorksheet('📊 Tổng quan', {
    views: [{ showGridLines: false }],
  })

  // Title with gradient effect
  statsSheet.mergeCells('A1:D2')
  const titleCell = statsSheet.getCell('A1')
  titleCell.value = '📊 THỐNG KÊ NỀN TẢNG'
  titleCell.font = {
    bold: true,
    size: 20,
    color: { argb: colors.primary },
    name: 'Segoe UI',
  }
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' }
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: colors.light },
  }
  statsSheet.getRow(1).height = 30
  statsSheet.getRow(2).height = 30

  // Subtitle
  statsSheet.mergeCells('A3:D3')
  const subtitleCell = statsSheet.getCell('A3')
  subtitleCell.value = `Thời gian: ${timeRange === 'week' ? '7 ngày qua' : timeRange === 'month' ? '30 ngày qua' : '365 ngày qua'}`
  subtitleCell.font = {
    size: 11,
    color: { argb: 'FF64748B' },
    italic: true,
    name: 'Segoe UI',
  }
  subtitleCell.alignment = { horizontal: 'center', vertical: 'middle' }
  statsSheet.getRow(3).height = 25

  // Headers
  const statsHeaderRow = statsSheet.getRow(5)
  statsHeaderRow.values = [
    '📈 Chỉ số',
    '🔢 Giá trị',
    '📊 Thay đổi',
    '💡 Trạng thái',
  ]
  applyHeaderStyle(statsHeaderRow)

  // Data rows with icons and conditional formatting
  const statsData = [
    {
      metric: '👥 Tổng người dùng',
      value: data.platformStats.totalUsers,
      change: data.platformStats.userChange,
    },
    {
      metric: '📚 Tổng khóa học',
      value: data.platformStats.totalCourses,
      change: data.platformStats.courseChange,
    },
    {
      metric: '🎓 Tổng giảng viên',
      value: data.platformStats.totalInstructors,
      change: data.platformStats.instructorChange,
    },
    {
      metric: '💰 Tổng doanh thu',
      value: data.platformStats.totalRevenue,
      change: data.platformStats.revenueChange,
      isCurrency: true,
    },
  ]

  statsData.forEach((stat) => {
    const row = statsSheet.addRow([
      stat.metric,
      stat.isCurrency ? stat.value : stat.value.toLocaleString('vi-VN'),
      formatPercentage(stat.change),
      stat.change >= 0 ? '✅ Tăng' : '⚠️ Giảm',
    ])

    row.height = 28

    // Format currency if needed
    if (stat.isCurrency) {
      row.getCell(2).numFmt = '#,##0 "₫"'
    }

    // Conditional formatting for change
    const changeCell = row.getCell(3)
    const statusCell = row.getCell(4)
    if (stat.change >= 0) {
      changeCell.font = {
        bold: true,
        color: { argb: colors.success },
        name: 'Segoe UI',
      }
      statusCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD1FAE5' },
      }
      statusCell.font = {
        bold: true,
        color: { argb: colors.success },
        name: 'Segoe UI',
      }
    } else {
      changeCell.font = {
        bold: true,
        color: { argb: colors.danger },
        name: 'Segoe UI',
      }
      statusCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFECACA' },
      }
      statusCell.font = {
        bold: true,
        color: { argb: colors.danger },
        name: 'Segoe UI',
      }
    }
  })

  applyAlternatingRows(statsSheet, 6, 9)

  // Column widths
  statsSheet.columns = [
    { width: 30 },
    { width: 20 },
    { width: 18 },
    { width: 18 },
  ]

  // 2. Revenue Overview Sheet - Premium Design
  const revenueSheet = workbook.addWorksheet('💵 Doanh thu', {
    views: [{ showGridLines: false }],
  })

  // Title
  revenueSheet.mergeCells('A1:D2')
  const revTitleCell = revenueSheet.getCell('A1')
  revTitleCell.value = '💵 TỔNG QUAN DOANH THU'
  revTitleCell.font = {
    bold: true,
    size: 20,
    color: { argb: colors.success },
    name: 'Segoe UI',
  }
  revTitleCell.alignment = { horizontal: 'center', vertical: 'middle' }
  revTitleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: colors.light },
  }
  revenueSheet.getRow(1).height = 30
  revenueSheet.getRow(2).height = 30

  // Summary Cards
  revenueSheet.mergeCells('A4:D4')
  const summaryHeader = revenueSheet.getCell('A4')
  summaryHeader.value = '📊 CHỈ SỐ TỔNG QUAN'
  summaryHeader.font = {
    bold: true,
    size: 14,
    color: { argb: 'FFFFFFFF' },
    name: 'Segoe UI',
  }
  summaryHeader.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: colors.secondary },
  }
  summaryHeader.alignment = { horizontal: 'center', vertical: 'middle' }
  revenueSheet.getRow(4).height = 30

  const summaryData = [
    { label: '💰 Doanh thu năm:', value: data.revenueOverview.yearlyRevenue },
    { label: '🏦 Phí nền tảng:', value: data.revenueOverview.platformFee },
    {
      label: '👨‍🏫 Thu nhập GV:',
      value: data.revenueOverview.instructorEarnings,
    },
    {
      label: '📈 AOV trung bình:',
      value: data.revenueOverview.averageOrderValue,
    },
  ]

  summaryData.forEach((item) => {
    const row = revenueSheet.addRow([item.label, ''])
    row.height = 26
    row.getCell(1).font = { bold: true, name: 'Segoe UI' }

    const valueCell = row.getCell(2)
    valueCell.value = Number(item.value)
    valueCell.numFmt = '#,##0'
    valueCell.font = {
      color: { argb: colors.primary },
      size: 12,
      bold: true,
      name: 'Segoe UI',
    }
  })

  // Monthly Revenue Table
  revenueSheet.mergeCells('A10:D10')
  const monthlyHeader = revenueSheet.getCell('A10')
  monthlyHeader.value = '📅 DOANH THU THEO THÁNG'
  monthlyHeader.font = {
    bold: true,
    size: 14,
    color: { argb: 'FFFFFFFF' },
    name: 'Segoe UI',
  }
  monthlyHeader.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: colors.secondary },
  }
  monthlyHeader.alignment = { horizontal: 'center', vertical: 'middle' }
  revenueSheet.getRow(10).height = 30

  const monthlyHeaderRow = revenueSheet.getRow(12)
  monthlyHeaderRow.values = [
    '📅 Tháng',
    '💰 Doanh thu',
    '📚 Số khóa học',
    '📊 % Tổng',
  ]
  applyHeaderStyle(monthlyHeaderRow)

  const totalRevenue = data.revenueOverview.monthlyRevenue.reduce(
    (sum, item) => sum + item.revenue,
    0,
  )

  data.revenueOverview.monthlyRevenue.forEach((item) => {
    const row = revenueSheet.addRow([
      item.month,
      '',
      item.courses,
      ((item.revenue / totalRevenue) * 100).toFixed(1) + '%',
    ])
    row.height = 28

    const revenueCell = row.getCell(2)
    revenueCell.value = Number(item.revenue)
    revenueCell.numFmt = '#,##0'
    revenueCell.font = {
      bold: true,
      color: { argb: colors.success },
      name: 'Segoe UI',
    }
  })

  applyAlternatingRows(
    revenueSheet,
    13,
    12 + data.revenueOverview.monthlyRevenue.length,
  )

  // Total row
  const totalRow = revenueSheet.addRow([
    '🔢 TỔNG CỘNG',
    '',
    data.revenueOverview.monthlyRevenue.reduce(
      (sum, item) => sum + item.courses,
      0,
    ),
    '100%',
  ])
  totalRow.height = 32
  totalRow.eachCell((cell) => {
    cell.font = {
      bold: true,
      size: 12,
      color: { argb: 'FFFFFFFF' },
      name: 'Segoe UI',
    }
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: colors.primary },
    }
  })

  const totalRevenueCell = totalRow.getCell(2)
  totalRevenueCell.value = Number(totalRevenue)
  totalRevenueCell.numFmt = '#,##0'

  // Column widths
  revenueSheet.columns = [
    { width: 20 },
    { width: 25 },
    { width: 18 },
    { width: 15 },
  ]

  // 3. Active Users Sheet - Premium Design
  const usersSheet = workbook.addWorksheet('👥 Người dùng', {
    views: [{ showGridLines: false }],
  })

  // Title
  usersSheet.mergeCells('A1:E2')
  const usersTitleCell = usersSheet.getCell('A1')
  usersTitleCell.value = '👥 THỐNG KÊ NGƯỜI DÙNG'
  usersTitleCell.font = {
    bold: true,
    size: 20,
    color: { argb: colors.info },
    name: 'Segoe UI',
  }
  usersTitleCell.alignment = { horizontal: 'center', vertical: 'middle' }
  usersTitleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: colors.light },
  }
  usersSheet.getRow(1).height = 30
  usersSheet.getRow(2).height = 30

  // Summary Section
  usersSheet.mergeCells('A4:E4')
  const usersSummaryHeader = usersSheet.getCell('A4')
  usersSummaryHeader.value = '📊 CHỈ SỐ TỔNG QUAN'
  usersSummaryHeader.font = {
    bold: true,
    size: 14,
    color: { argb: 'FFFFFFFF' },
    name: 'Segoe UI',
  }
  usersSummaryHeader.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: colors.secondary },
  }
  usersSummaryHeader.alignment = { horizontal: 'center', vertical: 'middle' }
  usersSheet.getRow(4).height = 30

  const usersSummaryData = [
    [
      '👤 Tổng người dùng:',
      data.activeUsers.totalUsers.toLocaleString('vi-VN'),
      '📈 Tăng trưởng:',
      formatPercentage(data.activeUsers.userGrowth),
    ],
    [
      '🎓 Học viên:',
      `${data.activeUsers.studentCount.toLocaleString('vi-VN')} (${data.activeUsers.studentPercentage.toFixed(1)}%)`,
      '👨‍🏫 Giảng viên:',
      `${data.activeUsers.instructorCount.toLocaleString('vi-VN')} (${data.activeUsers.instructorPercentage.toFixed(1)}%)`,
    ],
    [
      '🔄 Tỷ lệ giữ chân:',
      `${data.activeUsers.retentionRate.toFixed(1)}%`,
      '',
      '',
    ],
  ]

  usersSummaryData.forEach((item) => {
    const row = usersSheet.addRow(item)
    row.height = 26
    row.getCell(1).font = { bold: true, name: 'Segoe UI' }
    row.getCell(2).font = {
      color: { argb: colors.primary },
      size: 11,
      bold: true,
      name: 'Segoe UI',
    }
    row.getCell(3).font = { bold: true, name: 'Segoe UI' }
    row.getCell(4).font = {
      color: { argb: colors.primary },
      size: 11,
      bold: true,
      name: 'Segoe UI',
    }
  })

  // Monthly Trend
  usersSheet.mergeCells('A9:E9')
  const trendHeader = usersSheet.getCell('A9')
  trendHeader.value = '📈 XU HƯỚNG THEO THÁNG'
  trendHeader.font = {
    bold: true,
    size: 14,
    color: { argb: 'FFFFFFFF' },
    name: 'Segoe UI',
  }
  trendHeader.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: colors.secondary },
  }
  trendHeader.alignment = { horizontal: 'center', vertical: 'middle' }
  usersSheet.getRow(9).height = 30

  const trendHeaderRow = usersSheet.getRow(11)
  trendHeaderRow.values = [
    '📅 Tháng',
    '👥 Active Users',
    '🆕 New Users',
    '📊 Tăng trưởng',
    '💡 Xu hướng',
  ]
  applyHeaderStyle(trendHeaderRow)

  data.activeUsers.monthlyData.forEach((item, index) => {
    const prevMonth =
      index > 0
        ? data.activeUsers.monthlyData[index - 1].activeUsers
        : item.activeUsers
    const growth =
      prevMonth > 0 ? ((item.activeUsers - prevMonth) / prevMonth) * 100 : 0

    const row = usersSheet.addRow([
      item.month,
      item.activeUsers,
      item.newUsers,
      formatPercentage(growth),
      growth >= 0 ? '📈 Tăng' : '📉 Giảm',
    ])
    row.height = 28

    // Conditional formatting
    if (growth >= 0) {
      row.getCell(4).font = {
        bold: true,
        color: { argb: colors.success },
        name: 'Segoe UI',
      }
    } else {
      row.getCell(4).font = {
        bold: true,
        color: { argb: colors.danger },
        name: 'Segoe UI',
      }
    }
  })

  applyAlternatingRows(usersSheet, 12, 11 + data.activeUsers.monthlyData.length)

  // Column widths
  usersSheet.columns = [
    { width: 20 },
    { width: 20 },
    { width: 18 },
    { width: 18 },
    { width: 18 },
  ]

  // 4. Recent Activities Sheet - Premium Design
  const activitiesSheet = workbook.addWorksheet('🔔 Hoạt động', {
    views: [{ showGridLines: false }],
  })

  // Title
  activitiesSheet.mergeCells('A1:E2')
  const actTitleCell = activitiesSheet.getCell('A1')
  actTitleCell.value = '🔔 HOẠT ĐỘNG GẦN ĐÂY'
  actTitleCell.font = {
    bold: true,
    size: 20,
    color: { argb: colors.accent },
    name: 'Segoe UI',
  }
  actTitleCell.alignment = { horizontal: 'center', vertical: 'middle' }
  actTitleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: colors.light },
  }
  activitiesSheet.getRow(1).height = 30
  activitiesSheet.getRow(2).height = 30

  // Recent Courses Section
  activitiesSheet.mergeCells('A4:E4')
  const coursesHeader = activitiesSheet.getCell('A4')
  coursesHeader.value = '📚 KHÓA HỌC MỚI'
  coursesHeader.font = {
    bold: true,
    size: 14,
    color: { argb: 'FFFFFFFF' },
    name: 'Segoe UI',
  }
  coursesHeader.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: colors.secondary },
  }
  coursesHeader.alignment = { horizontal: 'center', vertical: 'middle' }
  activitiesSheet.getRow(4).height = 30

  const coursesHeaderRow = activitiesSheet.getRow(6)
  coursesHeaderRow.values = [
    '📚 Tên khóa học',
    '👥 Học viên',
    '🎯 Trạng thái',
    '📅 Ngày tạo',
  ]
  applyHeaderStyle(coursesHeaderRow)

  data.recentActivities.recentCourses.forEach((course) => {
    const row = activitiesSheet.addRow([
      course.title,
      course.enrollmentCount,
      course.status === 'PUBLISHED'
        ? 'Đã xuất bản'
        : course.status === 'PENDING'
          ? 'Chờ duyệt'
          : 'Nháp',
      formatDate(course.createdAt),
    ])
    row.height = 28

    // Status badges
    const statusCell = row.getCell(3)
    if (course.status === 'PUBLISHED') {
      statusCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD1FAE5' },
      }
      statusCell.font = {
        bold: true,
        color: { argb: colors.success },
        name: 'Segoe UI',
      }
    } else if (course.status === 'PENDING') {
      statusCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFEF3C7' },
      }
      statusCell.font = {
        bold: true,
        color: { argb: colors.warning },
        name: 'Segoe UI',
      }
    }
  })

  applyAlternatingRows(
    activitiesSheet,
    7,
    6 + data.recentActivities.recentCourses.length,
  )

  // Recent Reviews Section
  const reviewStartRow = 8 + data.recentActivities.recentCourses.length
  activitiesSheet.mergeCells(`A${reviewStartRow}:E${reviewStartRow}`)
  const reviewsHeader = activitiesSheet.getCell(`A${reviewStartRow}`)
  reviewsHeader.value = '⭐ ĐÁNH GIÁ MỚI'
  reviewsHeader.font = {
    bold: true,
    size: 14,
    color: { argb: 'FFFFFFFF' },
    name: 'Segoe UI',
  }
  reviewsHeader.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: colors.secondary },
  }
  reviewsHeader.alignment = { horizontal: 'center', vertical: 'middle' }
  activitiesSheet.getRow(reviewStartRow).height = 30

  const reviewsHeaderRow = activitiesSheet.getRow(reviewStartRow + 2)
  reviewsHeaderRow.values = [
    '👤 Học viên',
    '⭐ Đánh giá',
    '📚 Khóa học',
    '💬 Nhận xét',
    '📅 Ngày',
  ]
  applyHeaderStyle(reviewsHeaderRow)

  data.recentActivities.recentReviews.forEach((review) => {
    const row = activitiesSheet.addRow([
      review.studentName,
      '⭐'.repeat(review.rating),
      review.courseTitle,
      review.comment,
      formatDate(review.createdAt),
    ])
    row.height = 28

    // Rating color
    const ratingCell = row.getCell(2)
    if (review.rating >= 4) {
      ratingCell.font = {
        bold: true,
        color: { argb: colors.success },
        name: 'Segoe UI',
      }
    } else if (review.rating >= 3) {
      ratingCell.font = { color: { argb: colors.warning }, name: 'Segoe UI' }
    } else {
      ratingCell.font = { color: { argb: colors.danger }, name: 'Segoe UI' }
    }
  })

  applyAlternatingRows(
    activitiesSheet,
    reviewStartRow + 3,
    reviewStartRow + 2 + data.recentActivities.recentReviews.length,
  )

  // Column widths
  activitiesSheet.columns = [
    { width: 30 },
    { width: 20 },
    { width: 35 },
    { width: 40 },
    { width: 16 },
  ]

  // Info note at the end
  const lastRow = activitiesSheet.rowCount + 2
  activitiesSheet.mergeCells(`A${lastRow}:E${lastRow}`)
  const infoCell = activitiesSheet.getCell(`A${lastRow}`)
  infoCell.value =
    '💡 Gợi ý: Select data và Insert > Chart để tạo biểu đồ trực quan'
  infoCell.font = {
    italic: true,
    size: 10,
    color: { argb: 'FF64748B' },
    name: 'Segoe UI',
  }
  infoCell.alignment = { horizontal: 'center', vertical: 'middle' }

  // Generate file and download
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })

  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `Admin_Dashboard_${timeRange}_${new Date().toISOString().split('T')[0]}.xlsx`
  a.click()
  window.URL.revokeObjectURL(url)
}
