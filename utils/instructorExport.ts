import ExcelJS from 'exceljs'
import {
  DashboardStatisticsDto,
  RevenueChartDto,
  CourseOverviewDto,
} from '@/services/instructorDashboardService'

interface ExportData {
  stats: DashboardStatisticsDto | null
  revenueChart: RevenueChartDto | null
  popularCourses: CourseOverviewDto | null
  recentCourses: CourseOverviewDto | null
  revenueCourses: CourseOverviewDto | null
}

/**
 * Export instructor dashboard data to Excel file with premium styling
 */
export const exportDashboardToExcel = async (
  data: ExportData,
  timeRange: string,
) => {
  const workbook = new ExcelJS.Workbook()

  // Set workbook properties
  workbook.creator = 'VinaAcademy'
  workbook.created = new Date()
  workbook.modified = new Date()

  // Professional color palette
  const colors = {
    primary: 'FF2563EB', // Modern blue
    secondary: 'FF8B5CF6', // Purple
    success: 'FF10B981', // Green
    danger: 'FFEF4444', // Red
    warning: 'FFF59E0B', // Amber
    background: 'FFF8FAFC', // Light gray
    header: 'FF1E293B', // Dark slate
    border: 'FFE2E8F0', // Light border
    accent: 'FF06B6D4', // Cyan
  }

  // Helper function to format currency
  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(num)
  }

  // Helper function to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  // Helper function to format status
  const formatStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      PUBLISHED: 'Đã xuất bản',
      DRAFT: 'Nháp',
      PENDING: 'Chờ duyệt',
      REJECTED: 'Bị từ chối',
    }
    return statusMap[status] || status
  }

  // Helper to apply premium header style
  const applyHeaderStyle = (row: ExcelJS.Row) => {
    row.height = 35
    row.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: colors.header },
      }
      cell.font = {
        bold: true,
        size: 11,
        color: { argb: 'FFFFFFFF' },
        name: 'Segoe UI',
      }
      cell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
      }
      cell.border = {
        bottom: { style: 'medium', color: { argb: colors.primary } },
      }
    })
  }

  // Helper to apply alternating row colors
  const applyAlternatingRows = (
    sheet: ExcelJS.Worksheet,
    startRow: number,
    endRow: number,
  ) => {
    for (let i = startRow; i <= endRow; i++) {
      const row = sheet.getRow(i)
      if (i % 2 === 0) {
        row.eachCell((cell) => {
          if (!cell.fill || (cell.fill as any).fgColor?.argb === 'FFFFFFFF') {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: colors.background },
            }
          }
        })
      }
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: colors.border } },
          left: { style: 'thin', color: { argb: colors.border } },
          bottom: { style: 'thin', color: { argb: colors.border } },
          right: { style: 'thin', color: { argb: colors.border } },
        }
      })
    }
  }

  // 1. Statistics Summary Sheet - Premium Design
  if (data.stats) {
    const statsSheet = workbook.addWorksheet('📊 Tổng quan', {
      views: [{ showGridLines: false }],
    })

    // Main Title with gradient effect
    statsSheet.mergeCells('A1:D2')
    const titleCell = statsSheet.getCell('A1')
    titleCell.value = '📊 BÁO CÁO THỐNG KÊ GIẢNG VIÊN'
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
      fgColor: { argb: 'FFF1F5F9' },
    }
    statsSheet.getRow(1).height = 30
    statsSheet.getRow(2).height = 30

    // Metadata with styling
    statsSheet.getCell('A4').value = '📅 Thời gian:'
    statsSheet.getCell('A4').font = { bold: true, size: 11, name: 'Segoe UI' }
    statsSheet.getCell('B4').value = timeRange
    statsSheet.getCell('B4').font = {
      size: 11,
      color: { argb: colors.primary },
      name: 'Segoe UI',
    }

    statsSheet.getCell('A5').value = '🕒 Ngày xuất:'
    statsSheet.getCell('A5').font = { bold: true, size: 11, name: 'Segoe UI' }
    statsSheet.getCell('B5').value = new Date().toLocaleString('vi-VN')
    statsSheet.getCell('B5').font = {
      size: 11,
      color: { argb: colors.primary },
      name: 'Segoe UI',
    }

    // Section header
    statsSheet.mergeCells('A7:D7')
    const sectionHeader = statsSheet.getCell('A7')
    sectionHeader.value = '💎 CHỈ SỐ CHÍNH'
    sectionHeader.font = {
      bold: true,
      size: 14,
      color: { argb: 'FFFFFFFF' },
      name: 'Segoe UI',
    }
    sectionHeader.alignment = { horizontal: 'center', vertical: 'middle' }
    sectionHeader.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: colors.primary },
    }
    statsSheet.getRow(7).height = 30

    // Column headers with premium style
    const headerRow = statsSheet.getRow(8)
    headerRow.values = [
      '📈 Chỉ số',
      '💰 Giá trị hiện tại',
      '📊 Thay đổi (%)',
      '✨ Trạng thái',
    ]
    applyHeaderStyle(headerRow)

    // Data rows with icons and conditional formatting
    const dataRows = [
      {
        metric: '💵 Doanh thu',
        current: formatCurrency(data.stats.revenue.current),
        change: `${data.stats.revenue.isIncrease ? '▲ +' : '▼ '}${data.stats.revenue.change.toFixed(1)}%`,
        status: data.stats.revenue.isIncrease ? '🟢 Tăng' : '🔴 Giảm',
        isIncrease: data.stats.revenue.isIncrease,
      },
      {
        metric: '👥 Học viên mới',
        current: data.stats.newStudents.current,
        change: `${data.stats.newStudents.isIncrease ? '▲ +' : '▼ '}${data.stats.newStudents.change.toFixed(1)}%`,
        status: data.stats.newStudents.isIncrease ? '🟢 Tăng' : '🔴 Giảm',
        isIncrease: data.stats.newStudents.isIncrease,
      },
      {
        metric: '⭐ Đánh giá TB',
        current: data.stats.averageRating.current.toFixed(2),
        change: `${data.stats.averageRating.totalReviews} đánh giá`,
        status: '📝',
        isIncrease: null,
      },
      {
        metric: '📚 Tổng khóa học',
        current: data.stats.totalCourses,
        change: '',
        status: '',
        isIncrease: null,
      },
      {
        metric: '✅ Hoàn thành',
        current: `${data.stats.completionRate.toFixed(1)}%`,
        change: '',
        status: '',
        isIncrease: null,
      },
    ]

    dataRows.forEach((rowData, index) => {
      const row = statsSheet.addRow([
        rowData.metric,
        rowData.current,
        rowData.change,
        rowData.status,
      ])

      row.height = 28
      row.eachCell((cell, colNumber) => {
        cell.font = { size: 11, name: 'Segoe UI' }
        cell.alignment = {
          vertical: 'middle',
          horizontal: colNumber === 1 ? 'left' : 'center',
        }

        // Status column color coding
        if (colNumber === 4 && rowData.isIncrease !== null) {
          cell.font = {
            ...cell.font,
            bold: true,
            color: {
              argb: rowData.isIncrease ? colors.success : colors.danger,
            },
          }
        }

        // Change column color coding
        if (colNumber === 3 && rowData.isIncrease !== null) {
          cell.font = {
            ...cell.font,
            color: {
              argb: rowData.isIncrease ? colors.success : colors.danger,
            },
          }
        }
      })
    })

    // Apply alternating row colors
    applyAlternatingRows(statsSheet, 9, 13)

    // Column widths
    statsSheet.columns = [
      { width: 28 },
      { width: 22 },
      { width: 22 },
      { width: 18 },
    ]

    // Add summary box
    statsSheet.mergeCells('A15:D15')
    const summaryBox = statsSheet.getCell('A15')
    summaryBox.value = '✨ Dashboard được cập nhật real-time từ hệ thống'
    summaryBox.font = {
      italic: true,
      size: 10,
      color: { argb: 'FF64748B' },
      name: 'Segoe UI',
    }
    summaryBox.alignment = { horizontal: 'center', vertical: 'middle' }
  }

  // 2. Revenue Chart Sheet - Modern Design
  if (data.revenueChart && data.revenueChart.data) {
    const revenueSheet = workbook.addWorksheet('💵 Doanh thu', {
      views: [{ showGridLines: false }],
    })

    // Title with gradient
    revenueSheet.mergeCells('A1:C2')
    const titleCell = revenueSheet.getCell('A1')
    titleCell.value = '💵 DOANH THU THEO THỜI GIAN'
    titleCell.font = {
      bold: true,
      size: 18,
      color: { argb: colors.primary },
      name: 'Segoe UI',
    }
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' }
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF1F5F9' },
    }
    revenueSheet.getRow(1).height = 25
    revenueSheet.getRow(2).height = 25

    // Header row
    const headerRow = revenueSheet.getRow(4)
    headerRow.values = ['📅 Thời gian', '💰 Doanh thu (VNĐ)', '📊 % Tổng']
    applyHeaderStyle(headerRow)

    // Calculate total for percentage
    const totalRevenue = data.revenueChart.data.reduce(
      (sum, item) => sum + item.revenue,
      0,
    )

    // Data rows with percentage
    data.revenueChart.data.forEach((item, index) => {
      const percentage = ((item.revenue / totalRevenue) * 100).toFixed(1)
      const row = revenueSheet.addRow([
        item.name,
        item.revenue,
        `${percentage}%`,
      ])

      row.height = 26
      row.getCell(2).numFmt = '#,##0 "₫"'
      row.getCell(2).font = {
        bold: true,
        color: { argb: colors.success },
        name: 'Segoe UI',
      }
      row.getCell(3).font = {
        color: { argb: colors.secondary },
        name: 'Segoe UI',
      }
    })

    // Apply styling
    applyAlternatingRows(revenueSheet, 5, 4 + data.revenueChart.data.length)

    // Total row with special styling
    const totalRow = revenueSheet.addRow(['', '', ''])
    const totalRowNum = totalRow.number
    revenueSheet.getCell(`A${totalRowNum}`).value = '💎 TỔNG CỘNG'
    revenueSheet.getCell(`A${totalRowNum}`).font = {
      bold: true,
      size: 12,
      color: { argb: 'FFFFFFFF' },
      name: 'Segoe UI',
    }
    revenueSheet.getCell(`B${totalRowNum}`).value = totalRevenue
    revenueSheet.getCell(`B${totalRowNum}`).numFmt = '#,##0 "₫"'
    revenueSheet.getCell(`B${totalRowNum}`).font = {
      bold: true,
      size: 12,
      color: { argb: 'FFFFFFFF' },
      name: 'Segoe UI',
    }
    revenueSheet.getCell(`C${totalRowNum}`).value = '100%'
    revenueSheet.getCell(`C${totalRowNum}`).font = {
      bold: true,
      size: 12,
      color: { argb: 'FFFFFFFF' },
      name: 'Segoe UI',
    }

    totalRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: colors.primary },
      }
      cell.alignment = { horizontal: 'center', vertical: 'middle' }
    })
    totalRow.height = 32

    // Column widths
    revenueSheet.columns = [{ width: 20 }, { width: 25 }, { width: 15 }]

    // Info note
    revenueSheet.mergeCells(`A${totalRowNum + 2}:C${totalRowNum + 2}`)
    const infoCell = revenueSheet.getCell(`A${totalRowNum + 2}`)
    infoCell.value =
      '💡 Gợi ý: Select data và Insert > Chart để tạo biểu đồ trực quan'
    infoCell.font = {
      italic: true,
      size: 10,
      color: { argb: 'FF64748B' },
      name: 'Segoe UI',
    }
    infoCell.alignment = { horizontal: 'center', vertical: 'middle' }
  }

  // 3. Popular Courses Sheet - Premium Table Design
  if (data.popularCourses && data.popularCourses.courses) {
    const popularSheet = workbook.addWorksheet('🔥 Phổ biến', {
      views: [{ showGridLines: false }],
    })

    // Title
    popularSheet.mergeCells('A1:I2')
    const titleCell = popularSheet.getCell('A1')
    titleCell.value = '🔥 KHÓA HỌC PHỔ BIẾN NHẤT'
    titleCell.font = {
      bold: true,
      size: 18,
      color: { argb: colors.primary },
      name: 'Segoe UI',
    }
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' }
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF1F5F9' },
    }
    popularSheet.getRow(1).height = 25
    popularSheet.getRow(2).height = 25

    // Header with icons
    const headerRow = popularSheet.getRow(4)
    headerRow.values = [
      '📚 Tên khóa học',
      '👥 Học viên',
      '⭐ Đánh giá',
      '💬 Reviews',
      '💰 Doanh thu',
      '🏷️ Giá',
      '✅ Hoàn thành',
      '🎯 Trạng thái',
      '🕒 Cập nhật',
    ]
    applyHeaderStyle(headerRow)

    // Data with smart formatting
    data.popularCourses.courses.forEach((course) => {
      const row = popularSheet.addRow([
        course.name,
        course.students,
        course.rating.toFixed(1),
        course.totalReviews,
        course.revenue,
        course.price,
        course.completionRate.toFixed(1) + '%',
        formatStatus(course.status),
        formatDate(course.lastUpdated),
      ])

      row.height = 28

      // Number formatting
      row.getCell(5).numFmt = '#,##0 "₫"'
      row.getCell(6).numFmt = '#,##0 "₫"'

      // Revenue color coding (green if > 5M)
      if (course.revenue > 5000000) {
        row.getCell(5).font = {
          bold: true,
          color: { argb: colors.success },
          name: 'Segoe UI',
        }
      }

      // Rating color coding
      const rating = course.rating
      if (rating >= 4.5) {
        row.getCell(3).font = {
          bold: true,
          color: { argb: colors.success },
          name: 'Segoe UI',
        }
      } else if (rating >= 4.0) {
        row.getCell(3).font = {
          color: { argb: colors.warning },
          name: 'Segoe UI',
        }
      } else {
        row.getCell(3).font = {
          color: { argb: colors.danger },
          name: 'Segoe UI',
        }
      }

      // Status badges
      const statusCell = row.getCell(8)
      switch (course.status) {
        case 'PUBLISHED':
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
          break
        case 'PENDING':
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
          break
        case 'DRAFT':
          statusCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE5E7EB' },
          }
          break
      }
    })

    applyAlternatingRows(
      popularSheet,
      5,
      4 + data.popularCourses.courses.length,
    )

    // Summary section with modern cards
    const summaryStartRow = popularSheet.rowCount + 3
    popularSheet.mergeCells(`A${summaryStartRow}:I${summaryStartRow}`)
    const summaryTitle = popularSheet.getCell(`A${summaryStartRow}`)
    summaryTitle.value = '📊 TỔNG KẾT'
    summaryTitle.font = {
      bold: true,
      size: 14,
      color: { argb: 'FFFFFFFF' },
      name: 'Segoe UI',
    }
    summaryTitle.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: colors.secondary },
    }
    summaryTitle.alignment = { horizontal: 'center', vertical: 'middle' }
    popularSheet.getRow(summaryStartRow).height = 30

    // Summary metrics in a nice layout
    const summaryMetrics = [
      [
        '📚 Tổng số khóa học:',
        data.popularCourses.summary.totalCourses,
        '👥 Tổng học viên:',
        data.popularCourses.summary.totalStudents,
      ],
      [
        '💰 Tổng doanh thu:',
        data.popularCourses.summary.totalRevenue,
        '✅ Hoàn thành TB:',
        `${data.popularCourses.summary.averageCompletionRate.toFixed(1)}%`,
      ],
    ]

    summaryMetrics.forEach((metrics) => {
      const row = popularSheet.addRow(metrics)
      row.height = 26
      row.getCell(1).font = { bold: true, name: 'Segoe UI' }
      row.getCell(2).font = {
        color: { argb: colors.primary },
        size: 12,
        bold: true,
        name: 'Segoe UI',
      }
      row.getCell(3).font = { bold: true, name: 'Segoe UI' }
      row.getCell(4).font = {
        color: { argb: colors.primary },
        size: 12,
        bold: true,
        name: 'Segoe UI',
      }

      if (typeof metrics[1] === 'number' && metrics[1] > 1000000) {
        row.getCell(2).numFmt = '#,##0 "₫"'
      }
    })

    // Column widths
    popularSheet.columns = [
      { width: 45 },
      { width: 12 },
      { width: 12 },
      { width: 12 },
      { width: 20 },
      { width: 20 },
      { width: 14 },
      { width: 16 },
      { width: 16 },
    ]
  }

  // 4. Recent Courses Sheet - Premium Table Design
  if (data.recentCourses && data.recentCourses.courses) {
    const recentSheet = workbook.addWorksheet('🆕 Mới nhất', {
      views: [{ showGridLines: false }],
    })

    // Title
    recentSheet.mergeCells('A1:I2')
    const titleCell = recentSheet.getCell('A1')
    titleCell.value = '🆕 KHÓA HỌC MỚI NHẤT'
    titleCell.font = {
      bold: true,
      size: 18,
      color: { argb: colors.secondary },
      name: 'Segoe UI',
    }
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' }
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF1F5F9' },
    }
    recentSheet.getRow(1).height = 25
    recentSheet.getRow(2).height = 25

    // Header with icons
    const headerRow = recentSheet.getRow(4)
    headerRow.values = [
      '📚 Tên khóa học',
      '👥 Học viên',
      '⭐ Đánh giá',
      '💬 Reviews',
      '💰 Doanh thu',
      '🏷️ Giá',
      '✅ Hoàn thành',
      '🎯 Trạng thái',
      '🕒 Cập nhật',
    ]
    applyHeaderStyle(headerRow)

    // Data with smart formatting
    data.recentCourses.courses.forEach((course) => {
      const row = recentSheet.addRow([
        course.name,
        course.students,
        course.rating.toFixed(1),
        course.totalReviews,
        course.revenue,
        course.price,
        course.completionRate.toFixed(1) + '%',
        formatStatus(course.status),
        formatDate(course.lastUpdated),
      ])

      row.height = 28

      // Number formatting
      row.getCell(5).numFmt = '#,##0 "₫"'
      row.getCell(6).numFmt = '#,##0 "₫"'

      // Revenue color coding
      if (course.revenue > 5000000) {
        row.getCell(5).font = {
          bold: true,
          color: { argb: colors.success },
          name: 'Segoe UI',
        }
      }

      // Rating color coding
      const rating = course.rating
      if (rating >= 4.5) {
        row.getCell(3).font = {
          bold: true,
          color: { argb: colors.success },
          name: 'Segoe UI',
        }
      } else if (rating >= 4.0) {
        row.getCell(3).font = {
          color: { argb: colors.warning },
          name: 'Segoe UI',
        }
      } else {
        row.getCell(3).font = {
          color: { argb: colors.danger },
          name: 'Segoe UI',
        }
      }

      // Status badges
      const statusCell = row.getCell(8)
      switch (course.status) {
        case 'PUBLISHED':
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
          break
        case 'PENDING':
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
          break
        case 'DRAFT':
          statusCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE5E7EB' },
          }
          break
      }
    })

    applyAlternatingRows(recentSheet, 5, 4 + data.recentCourses.courses.length)

    // Summary section with modern cards
    const summaryStartRow = recentSheet.rowCount + 3
    recentSheet.mergeCells(`A${summaryStartRow}:I${summaryStartRow}`)
    const summaryTitle = recentSheet.getCell(`A${summaryStartRow}`)
    summaryTitle.value = '📊 TỔNG KẾT'
    summaryTitle.font = {
      bold: true,
      size: 14,
      color: { argb: 'FFFFFFFF' },
      name: 'Segoe UI',
    }
    summaryTitle.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: colors.secondary },
    }
    summaryTitle.alignment = { horizontal: 'center', vertical: 'middle' }
    recentSheet.getRow(summaryStartRow).height = 30

    // Summary metrics in a nice layout
    const summaryMetrics = [
      [
        '📚 Tổng số khóa học:',
        data.recentCourses.summary.totalCourses,
        '👥 Tổng học viên:',
        data.recentCourses.summary.totalStudents,
      ],
      [
        '💰 Tổng doanh thu:',
        data.recentCourses.summary.totalRevenue,
        '✅ Hoàn thành TB:',
        `${data.recentCourses.summary.averageCompletionRate.toFixed(1)}%`,
      ],
    ]

    summaryMetrics.forEach((metrics) => {
      const row = recentSheet.addRow(metrics)
      row.height = 26
      row.getCell(1).font = { bold: true, name: 'Segoe UI' }
      row.getCell(2).font = {
        color: { argb: colors.primary },
        size: 12,
        bold: true,
        name: 'Segoe UI',
      }
      row.getCell(3).font = { bold: true, name: 'Segoe UI' }
      row.getCell(4).font = {
        color: { argb: colors.primary },
        size: 12,
        bold: true,
        name: 'Segoe UI',
      }

      if (typeof metrics[1] === 'number' && metrics[1] > 1000000) {
        row.getCell(2).numFmt = '#,##0 "₫"'
      }
    })

    // Column widths
    recentSheet.columns = [
      { width: 45 },
      { width: 12 },
      { width: 12 },
      { width: 12 },
      { width: 20 },
      { width: 20 },
      { width: 14 },
      { width: 16 },
      { width: 16 },
    ]
  }

  // 5. High Revenue Courses Sheet - Premium Table Design
  if (data.revenueCourses && data.revenueCourses.courses) {
    const revenueCoursesSheet = workbook.addWorksheet('💎 Doanh thu cao', {
      views: [{ showGridLines: false }],
    })

    // Title
    revenueCoursesSheet.mergeCells('A1:I2')
    const titleCell = revenueCoursesSheet.getCell('A1')
    titleCell.value = '💎 KHÓA HỌC DOANH THU CAO'
    titleCell.font = {
      bold: true,
      size: 18,
      color: { argb: colors.success },
      name: 'Segoe UI',
    }
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' }
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF1F5F9' },
    }
    revenueCoursesSheet.getRow(1).height = 25
    revenueCoursesSheet.getRow(2).height = 25

    // Header with icons
    const headerRow = revenueCoursesSheet.getRow(4)
    headerRow.values = [
      '📚 Tên khóa học',
      '👥 Học viên',
      '⭐ Đánh giá',
      '💬 Reviews',
      '💰 Doanh thu',
      '🏷️ Giá',
      '✅ Hoàn thành',
      '🎯 Trạng thái',
      '🕒 Cập nhật',
    ]
    applyHeaderStyle(headerRow)

    // Data with premium formatting
    data.revenueCourses.courses.forEach((course) => {
      const row = revenueCoursesSheet.addRow([
        course.name,
        course.students,
        course.rating.toFixed(1),
        course.totalReviews,
        course.revenue,
        course.price,
        course.completionRate.toFixed(1) + '%',
        formatStatus(course.status),
        formatDate(course.lastUpdated),
      ])

      row.height = 28

      // Number formatting
      row.getCell(5).numFmt = '#,##0 "₫"'
      row.getCell(6).numFmt = '#,##0 "₫"'

      // Revenue color coding - bold green for high revenue
      row.getCell(5).font = {
        bold: true,
        color: { argb: colors.success },
        size: 11,
        name: 'Segoe UI',
      }

      // Rating color coding
      const rating = course.rating
      if (rating >= 4.5) {
        row.getCell(3).font = {
          bold: true,
          color: { argb: colors.success },
          name: 'Segoe UI',
        }
      } else if (rating >= 4.0) {
        row.getCell(3).font = {
          color: { argb: colors.warning },
          name: 'Segoe UI',
        }
      } else {
        row.getCell(3).font = {
          color: { argb: colors.danger },
          name: 'Segoe UI',
        }
      }

      // Status badges
      const statusCell = row.getCell(8)
      switch (course.status) {
        case 'PUBLISHED':
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
          break
        case 'PENDING':
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
          break
        case 'DRAFT':
          statusCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE5E7EB' },
          }
          break
      }
    })

    applyAlternatingRows(
      revenueCoursesSheet,
      5,
      4 + data.revenueCourses.courses.length,
    )

    // Summary section with modern cards
    const summaryStartRow = revenueCoursesSheet.rowCount + 3
    revenueCoursesSheet.mergeCells(`A${summaryStartRow}:I${summaryStartRow}`)
    const summaryTitle = revenueCoursesSheet.getCell(`A${summaryStartRow}`)
    summaryTitle.value = '📊 TỔNG KẾT'
    summaryTitle.font = {
      bold: true,
      size: 14,
      color: { argb: 'FFFFFFFF' },
      name: 'Segoe UI',
    }
    summaryTitle.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: colors.secondary },
    }
    summaryTitle.alignment = { horizontal: 'center', vertical: 'middle' }
    revenueCoursesSheet.getRow(summaryStartRow).height = 30

    // Summary metrics in a nice layout
    const summaryMetrics = [
      [
        '📚 Tổng số khóa học:',
        data.revenueCourses.summary.totalCourses,
        '👥 Tổng học viên:',
        data.revenueCourses.summary.totalStudents,
      ],
      [
        '💰 Tổng doanh thu:',
        data.revenueCourses.summary.totalRevenue,
        '✅ Hoàn thành TB:',
        `${data.revenueCourses.summary.averageCompletionRate.toFixed(1)}%`,
      ],
    ]

    summaryMetrics.forEach((metrics) => {
      const row = revenueCoursesSheet.addRow(metrics)
      row.height = 26
      row.getCell(1).font = { bold: true, name: 'Segoe UI' }
      row.getCell(2).font = {
        color: { argb: colors.primary },
        size: 12,
        bold: true,
        name: 'Segoe UI',
      }
      row.getCell(3).font = { bold: true, name: 'Segoe UI' }
      row.getCell(4).font = {
        color: { argb: colors.primary },
        size: 12,
        bold: true,
        name: 'Segoe UI',
      }

      if (typeof metrics[1] === 'number' && metrics[1] > 1000000) {
        row.getCell(2).numFmt = '#,##0 "₫"'
      }
    })

    // Column widths
    revenueCoursesSheet.columns = [
      { width: 45 },
      { width: 12 },
      { width: 12 },
      { width: 12 },
      { width: 20 },
      { width: 20 },
      { width: 14 },
      { width: 16 },
      { width: 16 },
    ]
  }

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const filename = `BaoCao_GiangVien_${timeRange}_${timestamp}.xlsx`

  // Write file
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })

  // Trigger download
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()
  URL.revokeObjectURL(link.href)
}
