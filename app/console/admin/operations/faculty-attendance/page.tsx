'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Stack,
  InputAdornment,
  TablePagination,
  Tooltip,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import StopRoundedIcon from '@mui/icons-material/StopRounded';
import SwapHorizRoundedIcon from '@mui/icons-material/SwapHorizRounded';
import FilterAltOffRoundedIcon from '@mui/icons-material/FilterAltOffRounded';
import FactCheckRoundedIcon from '@mui/icons-material/FactCheckRounded';
import WorkOutlineRoundedIcon from '@mui/icons-material/WorkOutlineRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import EventBusyRoundedIcon from '@mui/icons-material/EventBusyRounded';
import MeetingRoomRoundedIcon from '@mui/icons-material/MeetingRoomRounded';
import QrCode2RoundedIcon from '@mui/icons-material/QrCode2Rounded';
import PrintRoundedIcon from '@mui/icons-material/PrintRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import QRCode from 'qrcode';

import PageHeader from '@/components/common/PageHeader';
import StatCard from '@/components/common/StatCard';
import { useToast } from '@/components/common/ToastProvider';
import { ispColors } from '@/theme/colors';
import {
  FacultyAttendanceRecord,
  StaffAttendanceRecord,
  AttendanceStats,
} from '@/lib/types/facultyAttendance';

const DAYS_OF_WEEK = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

export default function FacultyAndStaffAttendancePage() {
  const { success, error: toastError, info } = useToast();

  const [activeTab, setActiveTab] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

  // Settings State
  const [allowTeacherSelfAttendance, setAllowTeacherSelfAttendance] = React.useState(true);
  const [allowQrAttendance, setAllowQrAttendance] = React.useState(true);
  const [togglingSettings, setTogglingSettings] = React.useState(false);

  // Frontdesk QR Poster State
  const [qrModalOpen, setQrModalOpen] = React.useState(false);
  const [qrTargetUrl, setQrTargetUrl] = React.useState('https://console.ispctg.live/kiosk/punch');
  const [qrDataUrl, setQrDataUrl] = React.useState('');
  const [generatingQr, setGeneratingQr] = React.useState(false);

  // Dynamic Institutional Data from Database
  const [teachersList, setTeachersList] = React.useState<any[]>([]);
  const [batchesList, setBatchesList] = React.useState<any[]>([]);
  const [timetableRoutine, setTimetableRoutine] = React.useState<any[]>([]);

  // Today's Live Faculty Sessions
  const [todayRecords, setTodayRecords] = React.useState<FacultyAttendanceRecord[]>([]);
  // Administrative Staff Duty Shift Records
  const [staffRecords, setStaffRecords] = React.useState<StaffAttendanceRecord[]>([]);

  // History & Filters
  const [historyRecords, setHistoryRecords] = React.useState<FacultyAttendanceRecord[]>([]);
  const [totalCount, setTotalCount] = React.useState(0);
  const [stats, setStats] = React.useState<AttendanceStats>({
    totalSessions: 0,
    completedSessions: 0,
    inProgressSessions: 0,
    scheduledUpcoming: 0,
    totalStudentsFootfall: 0,
    totalDurationMinutes: 0,
    totalDurationFormatted: '0h 0m',
    cancelledOrSuspended: 0,
    facultyBreakdown: [],
  });

  // Filter States
  const [dateRangeFilter, setDateRangeFilter] = React.useState<string>('ALL');
  const [selectedFaculty, setSelectedFaculty] = React.useState<string>('ALL');
  const [selectedBatch, setSelectedBatch] = React.useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = React.useState<string>('ALL');
  const [searchQuery, setSearchQuery] = React.useState<string>('');

  // Pagination
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(25);

  // Modals
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [substituteDialogOpen, setSubstituteDialogOpen] = React.useState(false);
  const [substituteSession, setSubstituteSession] = React.useState<any>(null);
  const [substituteName, setSubstituteName] = React.useState('');
  const [savingAction, setSavingAction] = React.useState(false);

  // Form Fields
  const [formDate, setFormDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [formBatch, setFormBatch] = React.useState('');
  const [formFaculty, setFormFaculty] = React.useState('');
  const [formSlotStart, setFormSlotStart] = React.useState('07:30 AM');
  const [formSlotEnd, setFormSlotEnd] = React.useState('09:00 AM');
  const [formEntryTime, setFormEntryTime] = React.useState('');
  const [formExitTime, setFormExitTime] = React.useState('');
  const [formTotalStudents, setFormTotalStudents] = React.useState('15');
  const [formRemark, setFormRemark] = React.useState('');
  const [formDuration, setFormDuration] = React.useState('1:30:00');
  const [formStatus, setFormStatus] = React.useState<'PRESENT' | 'LATE' | 'CANCELLED' | 'SUSPENDED' | 'NO_STUDENT'>('PRESENT');

  const todayIsoDate = React.useMemo(() => new Date().toISOString().split('T')[0], []);
  const todayWeekday = React.useMemo(() => DAYS_OF_WEEK[new Date().getDay()], []);

  // Load All Operations & Institutional Data Dynamically
  const loadOperationsData = React.useCallback(async () => {
    setLoading(true);
    try {
      const [settingsRes, todayRes, staffRes, histRes, teachRes, batchRes, timeRes] = await Promise.all([
        fetch('/api/settings/attendance'),
        fetch(`/api/operations/faculty-attendance?date=${todayIsoDate}&limit=100`),
        fetch(`/api/operations/staff-attendance?date=${todayIsoDate}`),
        fetch(`/api/operations/faculty-attendance?limit=${rowsPerPage}&offset=${page * rowsPerPage}`),
        fetch('/api/teachers'),
        fetch('/api/academics/batches'),
        fetch('/api/academics/timetable'),
      ]);

      if (settingsRes.ok) {
        const sData = await settingsRes.json();
        if (sData.success && sData.settings) {
          setAllowTeacherSelfAttendance(Boolean(sData.settings.allowTeacherSelfAttendance));
          setAllowQrAttendance(sData.settings.allowQrAttendance !== false);
        }
      }

      let fetchedTodayLogs: FacultyAttendanceRecord[] = [];
      if (todayRes.ok) {
        const tData = await todayRes.json();
        if (tData.success) {
          fetchedTodayLogs = tData.records || [];
          setTodayRecords(fetchedTodayLogs);
        }
      }

      if (staffRes.ok) {
        const stData = await staffRes.json();
        if (stData.success) {
          setStaffRecords(stData.records || []);
        }
      }

      if (histRes.ok) {
        const hData = await histRes.json();
        if (hData.success) {
          setHistoryRecords(hData.records || []);
          setTotalCount(hData.totalCount || 0);
          if (hData.stats) setStats(hData.stats);
        }
      }

      let activeTeachers: any[] = [];
      if (teachRes.ok) {
        const trData = await teachRes.json();
        activeTeachers = trData.teachers || [];
        setTeachersList(activeTeachers);
        if (activeTeachers.length > 0 && !formFaculty) {
          setFormFaculty(activeTeachers[0].fullName || activeTeachers[0].nickname);
        }
      }

      if (batchRes.ok) {
        const bData = await batchRes.json();
        const activeBatches = bData.batches || [];
        setBatchesList(activeBatches);
        if (activeBatches.length > 0 && !formBatch) {
          setFormBatch(activeBatches[0].name);
        }
      }

      if (timeRes.ok) {
        const tmData = await timeRes.json();
        setTimetableRoutine(tmData.sessions || []);
      }
    } catch (err: any) {
      toastError(err.message || 'Error loading attendance operations');
    } finally {
      setLoading(false);
    }
  }, [todayIsoDate, rowsPerPage, page, formFaculty, formBatch, toastError]);

  React.useEffect(() => {
    loadOperationsData();
  }, [loadOperationsData]);

  // Combined Today's Live Roster (Timetable Routine + Live Attendance Logs)
  const todayLiveSessions = React.useMemo(() => {
    const dayRoutine = timetableRoutine.filter((s) => s.dayOfWeek?.toUpperCase() === todayWeekday);

    if (dayRoutine.length === 0 && todayRecords.length === 0) {
      return [];
    }

    // Map routine sessions with real-time check-in logs
    return dayRoutine.map((session) => {
      const matchLog = todayRecords.find(
        (log) =>
          log.batchName?.toLowerCase() === session.batchName?.toLowerCase() &&
          (log.facultyName?.toLowerCase() === session.teacherName?.toLowerCase() ||
            session.teacherName?.toLowerCase().includes(log.facultyName?.toLowerCase()) ||
            log.facultyName?.toLowerCase().includes(session.teacherName?.toLowerCase()))
      );

      return {
        id: matchLog?.id || session.id,
        isFromLog: Boolean(matchLog),
        batchName: session.batchName,
        subjectName: session.subject,
        facultyName: matchLog?.facultyName || session.teacherName,
        substituteFacultyName: matchLog?.substituteFacultyName || null,
        roomNumber: session.roomNumber,
        slotStart: session.startTime,
        slotEnd: session.endTime,
        entryTime: matchLog?.entryTime || null,
        exitTime: matchLog?.exitTime || null,
        duration: matchLog?.duration || null,
        totalStudents: matchLog?.totalStudents || 0,
        status: matchLog?.status || 'SCHEDULED',
        rawLog: matchLog,
      };
    });
  }, [timetableRoutine, todayWeekday, todayRecords]);

  // Toggle Self Attendance Setting
  const handleToggleSetting = async (checked: boolean) => {
    setTogglingSettings(true);
    try {
      const res = await fetch('/api/settings/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ allowTeacherSelfAttendance: checked }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to update setting');
      setAllowTeacherSelfAttendance(checked);
      if (checked) {
        success('Teacher Portal Self-Attendance is now ENABLED.');
      } else {
        info('Teacher Portal Self-Attendance is now LOCKED (Reception-Only).');
      }
    } catch (err: any) {
      toastError(err.message || 'Error updating settings');
    } finally {
      setTogglingSettings(false);
    }
  };

  // Toggle Frontdesk QR Setting
  const handleToggleQrSetting = async (checked: boolean) => {
    setTogglingSettings(true);
    try {
      const res = await fetch('/api/settings/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ allowQrAttendance: checked }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to update setting');
      setAllowQrAttendance(checked);
      if (checked) {
        success('Frontdesk QR Self-Attendance is now ENABLED.');
      } else {
        info('Frontdesk QR Self-Attendance is now DISABLED.');
      }
    } catch (err: any) {
      toastError(err.message || 'Error updating settings');
    } finally {
      setTogglingSettings(false);
    }
  };

  // Open Frontdesk QR Poster Modal
  const handleOpenQrModal = async () => {
    setGeneratingQr(true);
    try {
      const isLocal = typeof window !== 'undefined' && window.location.hostname.includes('localhost');
      const defaultUrl = isLocal ? 'https://console.ispctg.live/kiosk/punch' : `${window.location.origin}/kiosk/punch`;
      setQrTargetUrl(defaultUrl);

      const url = await QRCode.toDataURL(defaultUrl, {
        width: 380,
        margin: 2,
        color: {
          dark: '#061B57',
          light: '#FFFFFF',
        },
      });
      setQrDataUrl(url);
      setQrModalOpen(true);
    } catch (err) {
      console.error('Error generating QR:', err);
      toastError('Failed to generate QR code');
    } finally {
      setGeneratingQr(false);
    }
  };

  // Re-render QR code when URL is updated in the modal
  const handleUpdateQrUrl = async (newUrl: string) => {
    setQrTargetUrl(newUrl);
    if (!newUrl.trim()) return;
    try {
      const url = await QRCode.toDataURL(newUrl.trim(), {
        width: 380,
        margin: 2,
        color: {
          dark: '#061B57',
          light: '#FFFFFF',
        },
      });
      setQrDataUrl(url);
    } catch (e) {
      console.error('Error regenerating QR code:', e);
    }
  };

  // Print Frontdesk QR Poster
  const handlePrintQrPoster = () => {
    const punchUrl = qrTargetUrl.trim() || 'https://console.ispctg.live/kiosk/punch';
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toastError('Please allow popups in your browser to print the QR poster.');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>ISP Frontdesk QR Attendance Sheet</title>
          <style>
            @page { size: A4 portrait; margin: 0; }
            body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 40px; background: #FFFFFF; color: #0F172A; text-align: center; }
            .poster { max-width: 620px; margin: 0 auto; border: 3px solid #061B57; border-radius: 20px; padding: 36px 28px; box-sizing: border-box; }
            .header-badge { display: inline-block; background-color: #061B57; color: #FFFFFF; font-weight: 800; font-size: 13px; letter-spacing: 1.5px; padding: 6px 18px; border-radius: 20px; margin-bottom: 16px; }
            h1 { font-size: 28px; font-weight: 900; color: #061B57; margin: 0 0 6px 0; }
            h2 { font-size: 17px; font-weight: 700; color: #1748D1; margin: 0 0 20px 0; }
            .qr-container { background: #FFFFFF; border: 2px dashed #1748D1; border-radius: 16px; padding: 16px; display: inline-block; margin: 10px 0 20px; }
            .qr-img { width: 280px; height: 280px; display: block; margin: 0 auto; }
            .url-label { font-size: 13px; color: #64748B; font-weight: 700; font-family: monospace; margin-top: 8px; word-break: break-all; }
            .instructions { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 18px 24px; margin: 20px 0; text-align: left; }
            .instructions h3 { margin: 0 0 10px 0; font-size: 15px; color: #061B57; font-weight: 800; }
            .instructions ol { margin: 0; padding-left: 22px; font-size: 13.5px; color: #334155; line-height: 1.6; font-weight: 600; }
            .footer { margin-top: 24px; font-size: 12px; color: #64748B; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="poster">
            <div class="header-badge">INDICATOR STUDENT'S POINT</div>
            <h1>FACULTY FRONTDESK ATTENDANCE</h1>
            <h2>Point Mobile Camera to Scan &amp; Self-Punch Attendance</h2>
            
            <div class="qr-container">
              <img src="${qrDataUrl}" class="qr-img" alt="Frontdesk QR Code" />
              <div class="url-label">${punchUrl}</div>
            </div>

            <div class="instructions">
              <h3>📱 How to Mark Attendance:</h3>
              <ol>
                <li>Open your mobile phone camera and scan the QR code above.</li>
                <li>Select your name from the active educators list.</li>
                <li>Enter the last 4 digits of your registered mobile number as PIN.</li>
                <li>Tap <strong>Punch In</strong> upon arrival or <strong>Punch Out</strong> upon leaving.</li>
              </ol>
            </div>

            <div class="footer">
              Built with <span style="color: #E11D48;">❤️</span> by Sadi Jubair &amp; OGIT
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Reception Quick Punch-In for Teacher
  const handleReceptionPunchIn = async (session: any) => {
    try {
      const nowStr = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
      const res = await fetch('/api/operations/faculty-attendance/punch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: session.rawLog ? session.id : undefined,
          action: 'CHECK_IN',
          checkInMethod: 'ADMIN_RECEPTION',
          time: nowStr,
          date: todayIsoDate,
          batchName: session.batchName,
          slotStart: session.slotStart,
          slotEnd: session.slotEnd,
          facultyName: session.facultyName,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Check-in failed');
      success(`Marked ${session.facultyName} Present & In-Class for ${session.batchName}`);
      loadOperationsData();
    } catch (err: any) {
      toastError(err.message || 'Error marking check-in');
    }
  };

  // Reception Quick Punch-Out for Teacher
  const handleReceptionPunchOut = async (session: any) => {
    try {
      const nowStr = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
      const res = await fetch('/api/operations/faculty-attendance/punch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: session.id,
          action: 'CHECK_OUT',
          checkInMethod: 'ADMIN_RECEPTION',
          time: nowStr,
          entryTime: session.entryTime,
          totalStudents: 15,
          status: 'PRESENT',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Check-out failed');
      success(`Session completed for ${session.facultyName}! Teaching duration logged.`);
      loadOperationsData();
    } catch (err: any) {
      toastError(err.message || 'Error marking check-out');
    }
  };

  // Assign Substitute Teacher Modal
  const handleOpenSubstituteModal = (session: any) => {
    setSubstituteSession(session);
    if (teachersList.length > 0) {
      setSubstituteName(teachersList[0].fullName || teachersList[0].nickname);
    }
    setSubstituteDialogOpen(true);
  };

  const handleConfirmSubstitute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!substituteSession || !substituteName) return;

    setSavingAction(true);
    try {
      let sessionLogId = substituteSession.id;

      // If not yet created in DB, create initial record first
      if (!substituteSession.rawLog) {
        const createRes = await fetch('/api/operations/faculty-attendance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: todayIsoDate,
            batchName: substituteSession.batchName,
            slotStart: substituteSession.slotStart,
            slotEnd: substituteSession.slotEnd,
            facultyName: substituteSession.facultyName,
            status: 'SCHEDULED',
          }),
        });
        const cData = await createRes.json();
        if (cData.success && cData.record) {
          sessionLogId = cData.record.id;
        }
      }

      const res = await fetch('/api/operations/faculty-attendance/punch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: sessionLogId,
          action: 'ASSIGN_SUBSTITUTE',
          substituteFacultyName: substituteName,
          originalFacultyName: substituteSession.facultyName,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to assign substitute');
      success(`Assigned ${substituteName} as substitute for ${substituteSession.batchName}!`);
      setSubstituteDialogOpen(false);
      loadOperationsData();
    } catch (err: any) {
      toastError(err.message || 'Error assigning substitute');
    } finally {
      setSavingAction(false);
    }
  };

  // Staff Daily Shift Punch
  const handleStaffPunch = async (staffId: string, action: 'PUNCH_IN' | 'PUNCH_OUT') => {
    try {
      const res = await fetch('/api/operations/staff-attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: staffId, date: todayIsoDate, action }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Staff punch failed');
      success(`Staff duty punch updated successfully!`);
      loadOperationsData();
    } catch (err: any) {
      toastError(err.message || 'Error punching staff attendance');
    }
  };

  // Open Log Session Modal
  const handleOpenCreateSession = () => {
    setEditingId(null);
    setFormDate(todayIsoDate);
    if (batchesList.length > 0) setFormBatch(batchesList[0].name);
    if (teachersList.length > 0) setFormFaculty(teachersList[0].fullName || teachersList[0].nickname);
    setFormSlotStart('07:30 AM');
    setFormSlotEnd('09:00 AM');
    setFormEntryTime('');
    setFormExitTime('');
    setFormTotalStudents('15');
    setFormRemark('');
    setFormDuration('1:30:00');
    setFormStatus('PRESENT');
    setDialogOpen(true);
  };

  // Save Session
  const handleSaveSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAction(true);
    try {
      const res = await fetch('/api/operations/faculty-attendance', {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingId,
          date: formDate,
          batchName: formBatch,
          facultyName: formFaculty,
          slotStart: formSlotStart,
          slotEnd: formSlotEnd,
          entryTime: formEntryTime || null,
          exitTime: formExitTime || null,
          totalStudents: formTotalStudents,
          remark: formRemark,
          duration: formDuration,
          status: formStatus,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to save session');
      success(editingId ? 'Session updated!' : 'New session logged!');
      setDialogOpen(false);
      loadOperationsData();
    } catch (err: any) {
      toastError(err.message || 'Error saving session');
    } finally {
      setSavingAction(false);
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    if (historyRecords.length === 0) {
      toastError('No records to export');
      return;
    }
    const headers = ['Date', 'Batch', 'Slot Start', 'Slot End', 'Faculty', 'Entry Time', 'Exit Time', 'Total Students', 'Duration', 'Status', 'Remark'];
    const rows = historyRecords.map((r) => [
      r.date,
      `"${r.batchName}"`,
      `"${r.slotStart}"`,
      `"${r.slotEnd}"`,
      `"${r.facultyName}"`,
      `"${r.entryTime || ''}"`,
      `"${r.exitTime || ''}"`,
      r.totalStudents,
      `"${r.duration || ''}"`,
      r.status,
      `"${r.remark || ''}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ISP_Attendance_Report_${todayIsoDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success('CSV Export downloaded successfully!');
  };

  return (
    <Box sx={{ pb: 6 }}>
      {/* 1. Page Header with Master Permission Switch & Primary Actions */}
      <PageHeader
        title="Faculty &amp; Staff Attendance"
        breadcrumbs={[
          { label: 'Console', href: '/admin/dashboard' },
          { label: 'Academic Operations' },
          { label: 'Faculty & Staff Attendance' },
        ]}
        action={
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            {/* Print Frontdesk QR Sheet Button */}
            <Button
              variant="outlined"
              startIcon={<QrCode2RoundedIcon />}
              onClick={handleOpenQrModal}
              disabled={generatingQr}
              sx={{
                borderColor: '#1748D1',
                color: '#1748D1',
                bgcolor: '#EEF4FF',
                fontWeight: 700,
                height: 40,
                '&:hover': { bgcolor: '#DBEAFE', borderColor: '#1748D1' },
              }}
            >
              Frontdesk QR Sheet
            </Button>

            <Button
              variant="outlined"
              startIcon={<FileDownloadRoundedIcon />}
              onClick={handleExportCSV}
              sx={{ borderColor: '#D0D5DD', color: '#344054', bgcolor: '#FFFFFF', height: 40 }}
            >
              Export
            </Button>
            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={handleOpenCreateSession}
              sx={{ bgcolor: ispColors.primary[600], '&:hover': { bgcolor: ispColors.primary[700] }, height: 40 }}
            >
              Log Class Session
            </Button>
          </Stack>
        }
      />

      {/* 2. Top Navigation Tabs */}
      <Box sx={{ mb: 3.5, bgcolor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', p: 0.5 }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 48,
            '& .MuiTab-root': {
              minHeight: 48,
              fontWeight: 700,
              fontSize: '13.5px',
              textTransform: 'none',
              color: '#475569',
              '&.Mui-selected': { color: '#1748D1', fontWeight: 800 },
            },
            '& .MuiTabs-indicator': { bgcolor: '#1748D1', height: 3, borderRadius: '3px 3px 0 0' },
          }}
        >
          <Tab icon={<FactCheckRoundedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label={`Today's Live Classes (${todayWeekday})`} />
          <Tab icon={<WorkOutlineRoundedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Administrative Staff Duty Shifts" />
          <Tab icon={<HistoryRoundedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Attendance History & Timesheets" />
        </Tabs>
      </Box>

      {/* ================================================================= */}
      {/* TAB 0: TODAY'S LIVE FACULTY ATTENDANCE COMMAND CENTER             */}
      {/* ================================================================= */}
      {activeTab === 0 && (
        <Box>
          {/* Live KPI Cards */}
          <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title="Classes Scheduled Today"
                value={todayLiveSessions.length.toString()}
                icon={<AccessTimeRoundedIcon sx={{ color: ispColors.primary[600] }} />}
                subtitle={`Routine planned for ${todayWeekday}`}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title="Currently In-Class"
                value={todayLiveSessions.filter((r) => r.status === 'IN_PROGRESS').length.toString()}
                icon={<PlayArrowRoundedIcon sx={{ color: '#059669' }} />}
                subtitle="Live active lectures"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title="Completed Sessions"
                value={todayLiveSessions.filter((r) => r.status === 'PRESENT' || r.status === 'LATE').length.toString()}
                icon={<CheckCircleRoundedIcon sx={{ color: '#2563EB' }} />}
                subtitle="Teaching hours completed"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title="Pending / Awaiting Arrival"
                value={todayLiveSessions.filter((r) => r.status === 'SCHEDULED').length.toString()}
                icon={<EventBusyRoundedIcon sx={{ color: '#DC2626' }} />}
                subtitle="Upcoming sessions today"
              />
            </Grid>
          </Grid>

          {/* Today's Roster Table */}
          <Paper sx={{ borderRadius: '12px', border: `1px solid ${ispColors.border.default}`, boxShadow: 'none', overflow: 'hidden' }}>
            <Box sx={{ p: 2.5, bgcolor: '#FFFFFF', borderBottom: `1px solid ${ispColors.border.default}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#061B57', fontSize: '17px' }}>
                  Live Class Sessions Roster &mdash; {todayWeekday} ({todayIsoDate})
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '13px' }}>
                  Synced in real-time with Academic Timetable routines, faculty arrivals, and substitute assignments.
                </Typography>
              </Box>
              <Button size="small" variant="outlined" onClick={loadOperationsData} sx={{ fontWeight: 600 }}>
                Refresh Live Roster
              </Button>
            </Box>

            <TableContainer>
              <Table sx={{ minWidth: 950 }}>
                <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '13px' }}>Slot Time</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '13px' }}>Batch &amp; Subject</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '13px' }}>Faculty Member</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '13px' }}>Room / Lab</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '13px' }}>Check-in &amp; Exit</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '13px' }}>Status</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: '#475569', fontSize: '13px' }}>
                      Reception Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {todayLiveSessions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                        <Typography variant="body1" sx={{ fontWeight: 700, color: '#64748B' }}>
                          No timetable sessions scheduled for {todayWeekday}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, mb: 2 }}>
                          You can add a slot in Academic Timetable or log an instant class session below.
                        </Typography>
                        <Button variant="contained" size="small" startIcon={<AddRoundedIcon />} onClick={handleOpenCreateSession}>
                          Log Session
                        </Button>
                      </TableCell>
                    </TableRow>
                  ) : (
                    todayLiveSessions.map((row) => (
                      <TableRow key={row.id} hover>
                        <TableCell sx={{ fontWeight: 600, color: '#0F172A', fontSize: '13.5px' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                            <AccessTimeRoundedIcon sx={{ fontSize: 16, color: '#64748B' }} />
                            {row.slotStart} – {row.slotEnd}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#061B57' }}>
                            {row.batchName}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748B' }}>
                            {row.subjectName}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#061B57', fontSize: '14px' }}>
                            {row.facultyName}
                          </Typography>
                          {row.substituteFacultyName && (
                            <Typography variant="caption" sx={{ color: '#D97706', fontWeight: 700, display: 'block' }}>
                              Substitute: {row.substituteFacultyName}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#334155', fontSize: '13px' }}>
                            <MeetingRoomRoundedIcon sx={{ fontSize: 15 }} />
                            {row.roomNumber || 'Room 101'}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontSize: '13px', color: '#334155' }}>
                          {row.entryTime && row.exitTime ? (
                            <span>
                              {row.entryTime} → {row.exitTime} ({row.duration || '—'})
                            </span>
                          ) : row.entryTime ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                              <CheckCircleRoundedIcon sx={{ fontSize: 15, color: '#059669' }} />
                              <span>In Class ({row.entryTime})</span>
                            </Box>
                          ) : (
                            <span style={{ color: '#94A3B8' }}>Awaiting arrival</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {row.status === 'IN_PROGRESS' ? (
                            <Chip label="In-Class" size="small" sx={{ bgcolor: '#FEF3C7', color: '#B45309', fontWeight: 700 }} />
                          ) : row.status === 'PRESENT' ? (
                            <Chip label="Completed" size="small" sx={{ bgcolor: '#ECFDF5', color: '#059669', fontWeight: 700 }} />
                          ) : row.status === 'LATE' ? (
                            <Chip label="Late Arrival" size="small" sx={{ bgcolor: '#FFFBEB', color: '#D97706', fontWeight: 700 }} />
                          ) : (
                            <Chip label="Scheduled" size="small" sx={{ bgcolor: '#F1F5F9', color: '#64748B', fontWeight: 600 }} />
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end', alignItems: 'center' }}>
                            {row.status === 'IN_PROGRESS' ? (
                              <Button
                                size="small"
                                variant="contained"
                                color="error"
                                startIcon={<StopRoundedIcon />}
                                onClick={() => handleReceptionPunchOut(row)}
                                sx={{ fontSize: '12px', fontWeight: 700, textTransform: 'none' }}
                              >
                                End Class
                              </Button>
                            ) : row.status === 'PRESENT' || row.status === 'LATE' ? (
                              <Typography variant="caption" sx={{ color: '#15803D', fontWeight: 700 }}>
                                Completed
                              </Typography>
                            ) : (
                              <>
                                <Button
                                  size="small"
                                  variant="contained"
                                  startIcon={<PlayArrowRoundedIcon />}
                                  onClick={() => handleReceptionPunchIn(row)}
                                  sx={{ bgcolor: '#059669', '&:hover': { bgcolor: '#047857' }, fontSize: '12px', fontWeight: 700, textTransform: 'none' }}
                                >
                                  Punch In
                                </Button>

                                <Tooltip title="Assign Substitute Faculty">
                                  <IconButton size="small" onClick={() => handleOpenSubstituteModal(row)} sx={{ color: '#475569' }}>
                                    <SwapHorizRoundedIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      )}

      {/* ================================================================= */}
      {/* TAB 1: ADMINISTRATIVE & OFFICE STAFF DUTY SHIFTS                 */}
      {/* ================================================================= */}
      {activeTab === 1 && (
        <Box>
          <Paper sx={{ borderRadius: '12px', border: `1px solid ${ispColors.border.default}`, boxShadow: 'none', overflow: 'hidden' }}>
            <Box sx={{ p: 2.5, bgcolor: '#FFFFFF', borderBottom: `1px solid ${ispColors.border.default}` }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#061B57', fontSize: '17px' }}>
                Non-Teaching Staff &amp; Administrative Duty Shifts
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '13px' }}>
                Daily office hours, shift timing (8:30 AM – 5:30 PM), punch in/out, working hours, and overtime.
              </Typography>
            </Box>

            <TableContainer>
              <Table sx={{ minWidth: 900 }}>
                <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '13px' }}>Staff Member</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '13px' }}>Designation / Role</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '13px' }}>Shift Window</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '13px' }}>Punch In</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '13px' }}>Punch Out</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '13px' }}>Duty Status</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: '#475569', fontSize: '13px' }}>
                      Duty Action
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {staffRecords.map((staff) => (
                    <TableRow key={staff.id} hover>
                      <TableCell sx={{ fontWeight: 700, color: '#0F172A', fontSize: '14px' }}>{staff.staffName}</TableCell>
                      <TableCell>
                        <Chip
                          label={staff.staffRole}
                          size="small"
                          sx={{ bgcolor: '#EEF4FF', color: '#1748D1', fontWeight: 600, fontSize: '12px', borderRadius: '4px' }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: '#475569', fontSize: '13px' }}>
                        {staff.shiftStart} – {staff.shiftEnd}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '13.5px', color: staff.punchInTime ? '#059669' : '#94A3B8' }}>
                        {staff.punchInTime || '—'}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '13.5px', color: staff.punchOutTime ? '#2563EB' : '#94A3B8' }}>
                        {staff.punchOutTime ? `${staff.punchOutTime} (${staff.workingHours || '8h 30m'})` : '—'}
                      </TableCell>
                      <TableCell>
                        {staff.punchInTime && !staff.punchOutTime ? (
                          <Chip label="On Duty" size="small" sx={{ bgcolor: '#ECFDF5', color: '#059669', fontWeight: 700 }} />
                        ) : staff.punchOutTime ? (
                          <Chip label="Completed" size="small" sx={{ bgcolor: '#F1F5F9', color: '#475569', fontWeight: 700 }} />
                        ) : (
                          <Chip label="Not Punched" size="small" sx={{ bgcolor: '#FEF2F2', color: '#DC2626', fontWeight: 700 }} />
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {!staff.punchInTime ? (
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => handleStaffPunch(staff.id, 'PUNCH_IN')}
                            sx={{ bgcolor: '#059669', '&:hover': { bgcolor: '#047857' }, fontSize: '12px', fontWeight: 700, textTransform: 'none' }}
                          >
                            Punch In
                          </Button>
                        ) : !staff.punchOutTime ? (
                          <Button
                            size="small"
                            variant="contained"
                            color="error"
                            onClick={() => handleStaffPunch(staff.id, 'PUNCH_OUT')}
                            sx={{ fontSize: '12px', fontWeight: 700, textTransform: 'none' }}
                          >
                            Punch Out
                          </Button>
                        ) : (
                          <Chip label="Shift Ended" size="small" sx={{ bgcolor: '#F1F5F9', color: '#64748B' }} />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      )}

      {/* ================================================================= */}
      {/* TAB 2: ATTENDANCE HISTORY, FILTERS & MONTHLY TIMESHEET             */}
      {/* ================================================================= */}
      {activeTab === 2 && (
        <Box>
          {/* Filter Toolbar */}
          <Card sx={{ mb: 3, borderRadius: '12px', border: `1px solid ${ispColors.border.default}`, boxShadow: 'none' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Grid container spacing={2} sx={{ alignItems: 'center' }}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Search faculty, batch, remark..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchRoundedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 6, sm: 3, md: 2 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Date Range</InputLabel>
                    <Select
                      value={dateRangeFilter}
                      label="Date Range"
                      onChange={(e) => {
                        setDateRangeFilter(e.target.value);
                        setPage(0);
                      }}
                    >
                      <MenuItem value="ALL">All Records</MenuItem>
                      <MenuItem value="TODAY">Today</MenuItem>
                      <MenuItem value="YESTERDAY">Yesterday</MenuItem>
                      <MenuItem value="LAST_7_DAYS">Last 7 Days</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 6, sm: 3, md: 2 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Faculty</InputLabel>
                    <Select
                      value={selectedFaculty}
                      label="Faculty"
                      onChange={(e) => {
                        setSelectedFaculty(e.target.value);
                        setPage(0);
                      }}
                    >
                      <MenuItem value="ALL">All Faculty</MenuItem>
                      {teachersList.map((t) => (
                        <MenuItem key={t.id} value={t.fullName}>
                          {t.fullName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 6, sm: 3, md: 2 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Batch</InputLabel>
                    <Select
                      value={selectedBatch}
                      label="Batch"
                      onChange={(e) => {
                        setSelectedBatch(e.target.value);
                        setPage(0);
                      }}
                    >
                      <MenuItem value="ALL">All Batches</MenuItem>
                      {batchesList.map((b) => (
                        <MenuItem key={b.id} value={b.name}>
                          {b.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 6, sm: 3, md: 1.8 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={selectedStatus}
                      label="Status"
                      onChange={(e) => {
                        setSelectedStatus(e.target.value);
                        setPage(0);
                      }}
                    >
                      <MenuItem value="ALL">All Status</MenuItem>
                      <MenuItem value="PRESENT">Present</MenuItem>
                      <MenuItem value="LATE">Late</MenuItem>
                      <MenuItem value="CANCELLED">Cancelled</MenuItem>
                      <MenuItem value="SUSPENDED">Suspended</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 3, md: 1.2 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    size="medium"
                    onClick={() => {
                      setDateRangeFilter('ALL');
                      setSelectedFaculty('ALL');
                      setSelectedBatch('ALL');
                      setSelectedStatus('ALL');
                      setSearchQuery('');
                      setPage(0);
                    }}
                    startIcon={<FilterAltOffRoundedIcon />}
                    sx={{ borderColor: '#E2E8F0', color: '#64748B', height: '40px' }}
                  >
                    Reset
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* History Data Table */}
          <Paper sx={{ borderRadius: '12px', border: `1px solid ${ispColors.border.default}`, boxShadow: 'none', overflow: 'hidden' }}>
            <TableContainer>
              <Table sx={{ minWidth: 900 }}>
                <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '13px' }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '13px' }}>Batch</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '13px' }}>Slot Time</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '13px' }}>Faculty</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '13px' }}>Entry → Exit</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '13px' }}>Students</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '13px' }}>Duration</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '13px' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '13px' }}>Remark</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {historyRecords.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                        <Typography variant="body1" sx={{ fontWeight: 700, color: '#64748B' }}>
                          No historical records found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    historyRecords.map((row) => (
                      <TableRow key={row.id} hover>
                        <TableCell sx={{ fontWeight: 600, fontSize: '13.5px', color: '#0F172A' }}>{row.date}</TableCell>
                        <TableCell>
                          <Chip label={row.batchName} size="small" sx={{ fontWeight: 700, borderRadius: '6px' }} />
                        </TableCell>
                        <TableCell sx={{ fontSize: '13px', color: '#475569' }}>
                          {row.slotStart} – {row.slotEnd}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '13.5px', color: '#061B57' }}>{row.facultyName}</TableCell>
                        <TableCell sx={{ fontSize: '13px', color: '#334155' }}>
                          {row.entryTime && row.exitTime ? `${row.entryTime} → ${row.exitTime}` : '—'}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '13.5px' }}>{row.totalStudents || 0}</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '13px', color: '#2563EB' }}>{row.duration || '—'}</TableCell>
                        <TableCell>
                          <Chip label={row.status} size="small" sx={{ fontWeight: 700, borderRadius: '6px' }} />
                        </TableCell>
                        <TableCell sx={{ fontSize: '12.5px', color: '#64748B', maxWidth: 180 }}>{row.remark || '—'}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              rowsPerPageOptions={[25, 50, 100]}
              component="div"
              count={totalCount}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              sx={{ borderTop: `1px solid ${ispColors.border.default}` }}
            />
          </Paper>
        </Box>
      )}

      {/* Substitute Teacher Reassignment Modal (Dynamic Teacher Dropdown) */}
      <Dialog open={substituteDialogOpen} onClose={() => !savingAction && setSubstituteDialogOpen(false)} maxWidth="xs" fullWidth>
        <form onSubmit={handleConfirmSubstitute}>
          <DialogTitle sx={{ fontWeight: 800, color: '#061B57', fontSize: '18px' }}>
            Assign Substitute Teacher
          </DialogTitle>
          <DialogContent dividers sx={{ p: 3 }}>
            <Stack spacing={2.5}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Reassigning instructor for <strong>{substituteSession?.batchName}</strong> (Original: {substituteSession?.facultyName}).
              </Typography>
              <FormControl fullWidth required>
                <InputLabel>Select Substitute Faculty</InputLabel>
                <Select
                  value={substituteName}
                  label="Select Substitute Faculty"
                  onChange={(e) => setSubstituteName(e.target.value)}
                >
                  {teachersList
                    .filter((t) => t.fullName !== substituteSession?.facultyName)
                    .map((t) => (
                      <MenuItem key={t.id} value={t.fullName}>
                        {t.fullName} {t.designation ? `(${t.designation})` : ''}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setSubstituteDialogOpen(false)} disabled={savingAction} sx={{ color: '#64748B' }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={savingAction}
              sx={{ bgcolor: ispColors.primary[600], '&:hover': { bgcolor: ispColors.primary[700] }, fontWeight: 700 }}
            >
              {savingAction ? <CircularProgress size={22} color="inherit" /> : 'Confirm Assignment'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Log / Edit Session Modal (Dynamic Batch and Teacher Dropdowns) */}
      <Dialog open={dialogOpen} onClose={() => !savingAction && setDialogOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleSaveSession}>
          <DialogTitle sx={{ fontWeight: 800, color: '#061B57', fontSize: '18px' }}>
            {editingId ? 'Edit Faculty Class Log' : 'Log Faculty Class Session'}
          </DialogTitle>
          <DialogContent dividers sx={{ p: 3 }}>
            <Stack spacing={2.5}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    required
                    fullWidth
                    type="date"
                    label="Date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth required>
                    <InputLabel>Batch Name</InputLabel>
                    <Select value={formBatch} label="Batch Name" onChange={(e) => setFormBatch(e.target.value)}>
                      {batchesList.map((b) => (
                        <MenuItem key={b.id} value={b.name}>
                          {b.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth required>
                    <InputLabel>Faculty Member</InputLabel>
                    <Select value={formFaculty} label="Faculty Member" onChange={(e) => setFormFaculty(e.target.value)}>
                      {teachersList.map((t) => (
                        <MenuItem key={t.id} value={t.fullName}>
                          {t.fullName} {t.designation ? `(${t.designation})` : ''}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select value={formStatus} label="Status" onChange={(e) => setFormStatus(e.target.value as any)}>
                      <MenuItem value="PRESENT">Present</MenuItem>
                      <MenuItem value="LATE">Late</MenuItem>
                      <MenuItem value="CANCELLED">Cancelled</MenuItem>
                      <MenuItem value="SUSPENDED">Suspended</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    required
                    fullWidth
                    label="Slot Start Time"
                    value={formSlotStart}
                    onChange={(e) => setFormSlotStart(e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    required
                    fullWidth
                    label="Slot End Time"
                    value={formSlotEnd}
                    onChange={(e) => setFormSlotEnd(e.target.value)}
                  />
                </Grid>
              </Grid>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setDialogOpen(false)} disabled={savingAction} sx={{ color: '#64748B' }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={savingAction}
              sx={{ bgcolor: ispColors.primary[600], '&:hover': { bgcolor: ispColors.primary[700] } }}
            >
              {savingAction ? <CircularProgress size={22} color="inherit" /> : 'Save Session'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Frontdesk QR Poster Modal */}
      <Dialog
        open={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: '16px', p: 1 } } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <QrCode2RoundedIcon sx={{ color: '#1748D1', fontSize: 28 }} />
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#061B57' }}>
              Frontdesk Attendance QR Poster
            </Typography>
          </Box>
          <IconButton onClick={() => setQrModalOpen(false)} size="small">
            <CloseRoundedIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ py: 3, textAlign: 'center' }}>
          <Box sx={{ maxWidth: 440, mx: 'auto' }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                border: '2px dashed #1748D1',
                borderRadius: '16px',
                bgcolor: '#FFFFFF',
                mb: 2.5,
              }}
            >
              <Typography variant="caption" sx={{ color: '#1748D1', fontWeight: 800, letterSpacing: '1px' }}>
                INDICATOR STUDENT&apos;S POINT
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#061B57', mt: 0.5, mb: 1 }}>
                FACULTY SELF-ATTENDANCE
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
                Scan with mobile camera &bull; Enter 4-digit PIN &bull; Punch In/Out
              </Typography>

              {qrDataUrl ? (
                <Box
                  component="img"
                  src={qrDataUrl}
                  alt="Frontdesk QR Code"
                  sx={{
                    width: 240,
                    height: 240,
                    mx: 'auto',
                    display: 'block',
                    borderRadius: '8px',
                  }}
                />
              ) : (
                <Box sx={{ py: 6 }}>
                  <CircularProgress size={32} />
                </Box>
              )}

              <Typography variant="caption" sx={{ color: '#1748D1', fontWeight: 700, fontFamily: 'monospace', display: 'block', mt: 1.5, wordBreak: 'break-all' }}>
                {qrTargetUrl}
              </Typography>
            </Paper>

            <Box sx={{ mb: 2.5, textAlign: 'left' }}>
              <TextField
                fullWidth
                size="small"
                label="Target URL encoded into QR Code"
                value={qrTargetUrl}
                onChange={(e) => handleUpdateQrUrl(e.target.value)}
                helperText="In production, use your live domain URL so mobile phones can connect."
                slotProps={{
                  input: {
                    sx: { fontFamily: 'monospace', fontSize: '13px', fontWeight: 600 },
                  },
                }}
              />
            </Box>

            <Paper sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0', textAlign: 'left' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#061B57', mb: 0.5 }}>
                💡 How to use this at Reception:
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.6, display: 'block' }}>
                1. Ensure the URL points to your public live domain (e.g. <code>https://console.ispctg.live/kiosk/punch</code>).<br />
                2. Click <strong>Print Sheet (A4)</strong> below to print the official reception poster.<br />
                3. Teachers can scan it directly with their mobile phone cameras to punch in/out within 2 seconds.
              </Typography>
            </Paper>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
          <Button onClick={() => setQrModalOpen(false)} sx={{ color: '#64748B' }}>
            Close
          </Button>
          <Button
            variant="contained"
            startIcon={<PrintRoundedIcon />}
            onClick={handlePrintQrPoster}
            sx={{
              bgcolor: '#1748D1',
              fontWeight: 800,
              px: 3,
              '&:hover': { bgcolor: '#092B91' },
            }}
          >
            Print Sheet (A4)
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
