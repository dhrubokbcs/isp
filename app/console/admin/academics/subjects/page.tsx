'use client';

import * as React from 'react';
import {
  Box,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Chip,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  IconButton,
  Tooltip,
  Switch,
  Alert,
  Drawer,
  Divider,
  Card,
  CardContent,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import AutoStoriesRoundedIcon from '@mui/icons-material/AutoStoriesRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import PostAddRoundedIcon from '@mui/icons-material/PostAddRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';

import PageHeader from '@/components/common/PageHeader';
import StatusChip from '@/components/common/StatusChip';
import { useToast } from '@/components/common/ToastProvider';
import { ispColors } from '@/theme/colors';
import { SubjectRecord, ChapterRecord, TopicRecord, ClassLevel } from '@/lib/db/supabaseAcademics';

const DEPARTMENT_CONFIG = {
  SCIENCE: {
    label: 'Science',
    bg: '#ECFDF5',
    color: '#065F46',
    border: '#A7F3D0',
  },
  COMMERCE: {
    label: 'Commerce',
    bg: '#FEF3C7',
    color: '#92400E',
    border: '#FDE68A',
  },
  ARTS: {
    label: 'Arts & Humanities',
    bg: '#F3E8FF',
    color: '#6B21A8',
    border: '#DDD6FE',
  },
  GENERAL: {
    label: 'General Track',
    bg: '#F1F5F9',
    color: '#334155',
    border: '#E2E8F0',
  },
};

export default function SubjectsPage() {
  const { success, error: toastError, info } = useToast();

  const [subjects, setSubjects] = React.useState<SubjectRecord[]>([]);
  const [classes, setClasses] = React.useState<ClassLevel[]>([]);
  const [selectedClassId, setSelectedClassId] = React.useState<string>('ALL');
  const [loading, setLoading] = React.useState(true);

  // Create Subject Modal
  const [openDialog, setOpenDialog] = React.useState(false);
  const [name, setName] = React.useState('');
  const [code, setCode] = React.useState('');
  const [classLevelId, setClassLevelId] = React.useState('');
  const [department, setDepartment] = React.useState<'SCIENCE' | 'COMMERCE' | 'ARTS' | 'GENERAL'>('SCIENCE');
  const [totalWeeklyClasses, setTotalWeeklyClasses] = React.useState('3');
  const [submitting, setSubmitting] = React.useState(false);

  // Edit Subject Modal
  const [editSubject, setEditSubject] = React.useState<SubjectRecord | null>(null);
  const [editName, setEditName] = React.useState('');
  const [editCode, setEditCode] = React.useState('');
  const [editClassLevelId, setEditClassLevelId] = React.useState('');
  const [editDepartment, setEditDepartment] = React.useState<'SCIENCE' | 'COMMERCE' | 'ARTS' | 'GENERAL'>('SCIENCE');
  const [editTotalWeeklyClasses, setEditTotalWeeklyClasses] = React.useState('3');
  const [submittingEdit, setSubmittingEdit] = React.useState(false);

  // Delete Subject Modal
  const [deleteItem, setDeleteItem] = React.useState<SubjectRecord | null>(null);
  const [submittingDelete, setSubmittingDelete] = React.useState(false);

  // Syllabus Management Drawer
  const [syllabusSubject, setSyllabusSubject] = React.useState<SubjectRecord | null>(null);

  // Chapter Modals
  const [chapterModalOpen, setChapterModalOpen] = React.useState(false);
  const [editingChapter, setEditingChapter] = React.useState<ChapterRecord | null>(null);
  const [chapterNumber, setChapterNumber] = React.useState('');
  const [chapterTitle, setChapterTitle] = React.useState('');
  const [chapterDesc, setChapterDesc] = React.useState('');
  const [submittingChapter, setSubmittingChapter] = React.useState(false);

  // Topic Modals
  const [topicModalOpen, setTopicModalOpen] = React.useState(false);
  const [targetChapterId, setTargetChapterId] = React.useState<string | null>(null);
  const [editingTopic, setEditingTopic] = React.useState<TopicRecord | null>(null);
  const [topicTitle, setTopicTitle] = React.useState('');
  const [topicLectures, setTopicLectures] = React.useState('2');
  const [topicNotes, setTopicNotes] = React.useState('');
  const [submittingTopic, setSubmittingTopic] = React.useState(false);

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [sRes, cRes] = await Promise.all([
        fetch('/api/academics/subjects'),
        fetch('/api/academics/classes'),
      ]);

      const sData = await sRes.json();
      const cData = await cRes.json();

      const rawSubjects = sData?.subjects || [];
      const rawClasses = cData?.classLevels || [];

      setSubjects(rawSubjects);
      setClasses(rawClasses);

      if (rawClasses.length > 0 && !classLevelId) {
        setClassLevelId(rawClasses[0].id);
      }
    } catch (err) {
      console.error('Failed to load academic subjects:', err);
      toastError('Failed to load subjects from database');
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  }, [classLevelId, toastError]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // Keep syllabusSubject in sync with latest subjects array
  React.useEffect(() => {
    if (syllabusSubject) {
      const fresh = subjects.find((s) => s.id === syllabusSubject.id);
      if (fresh) setSyllabusSubject(fresh);
    }
  }, [subjects, syllabusSubject]);

  // Filtered subjects based on class level tab
  const filteredSubjects = React.useMemo(() => {
    if (selectedClassId === 'ALL') return subjects;
    return subjects.filter((s) => s.classLevelId === selectedClassId);
  }, [subjects, selectedClassId]);

  // Create Subject Handler
  const handleOpenCreate = () => {
    setName('');
    setCode('');
    setDepartment('SCIENCE');
    setTotalWeeklyClasses('3');
    if (classes.length > 0 && (!classLevelId || selectedClassId !== 'ALL')) {
      setClassLevelId(selectedClassId !== 'ALL' ? selectedClassId : classes[0].id);
    }
    setOpenDialog(true);
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;

    setSubmitting(true);
    try {
      const selectedClass = classes.find((c) => c.id === classLevelId);
      const res = await fetch('/api/academics/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          code,
          classLevelId: classLevelId || undefined,
          targetLevel: selectedClass?.name || 'Class 9',
          department,
          totalWeeklyClasses: parseInt(totalWeeklyClasses, 10) || 3,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create subject');
      }

      success(`Subject ${name} registered successfully!`);
      setOpenDialog(false);
      loadData();
    } catch (err: any) {
      toastError(err.message || 'Error creating subject');
    } finally {
      setSubmitting(false);
    }
  };

  // Status Toggle
  const handleToggleStatus = async (subject: SubjectRecord) => {
    const nextStatus = !subject.isActive;
    setSubjects((prev) =>
      prev.map((s) => (s.id === subject.id ? { ...s, isActive: nextStatus } : s))
    );

    try {
      const res = await fetch('/api/academics/subjects', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: subject.id,
          action: 'TOGGLE_STATUS',
          isActive: nextStatus,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to toggle status');
      }
      info(`Subject ${subject.name} is now ${nextStatus ? 'Active' : 'Inactive'}.`);
    } catch (err: any) {
      toastError(err.message || 'Error updating status');
      loadData();
    }
  };

  // Edit Subject Handlers
  const handleOpenEdit = (subject: SubjectRecord) => {
    setEditSubject(subject);
    setEditName(subject.name);
    setEditCode(subject.code);
    setEditClassLevelId(subject.classLevelId || '');
    setEditDepartment(subject.department);
    setEditTotalWeeklyClasses(subject.totalWeeklyClasses.toString());
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editSubject || !editName.trim() || !editCode.trim()) return;

    setSubmittingEdit(true);
    try {
      const res = await fetch('/api/academics/subjects', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editSubject.id,
          name: editName,
          code: editCode,
          classLevelId: editClassLevelId || undefined,
          department: editDepartment,
          totalWeeklyClasses: parseInt(editTotalWeeklyClasses, 10) || 3,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update subject');
      }

      success(`Subject ${editName} updated successfully!`);
      setEditSubject(null);
      loadData();
    } catch (err: any) {
      toastError(err.message || 'Error updating subject');
    } finally {
      setSubmittingEdit(false);
    }
  };

  // Delete Subject Handlers
  const handleConfirmDelete = async () => {
    if (!deleteItem) return;

    setSubmittingDelete(true);
    try {
      const res = await fetch(`/api/academics/subjects?id=${deleteItem.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete subject');
      }

      success(`Subject ${deleteItem.name} deleted.`);
      setDeleteItem(null);
      loadData();
    } catch (err: any) {
      toastError(err.message || 'Error deleting subject');
    } finally {
      setSubmittingDelete(false);
    }
  };

  // -------------------------------------------------------------
  // CHAPTER HANDLERS
  // -------------------------------------------------------------
  const handleOpenAddChapter = () => {
    setEditingChapter(null);
    const nextNum = (syllabusSubject?.syllabus.length || 0) + 1;
    setChapterNumber(nextNum.toString());
    setChapterTitle('');
    setChapterDesc('');
    setChapterModalOpen(true);
  };

  const handleOpenEditChapter = (ch: ChapterRecord) => {
    setEditingChapter(ch);
    setChapterNumber(ch.chapterNumber.toString());
    setChapterTitle(ch.title);
    setChapterDesc(ch.description || '');
    setChapterModalOpen(true);
  };

  const handleSaveChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!syllabusSubject || !chapterTitle.trim()) return;

    setSubmittingChapter(true);
    try {
      const action = editingChapter ? 'UPDATE_CHAPTER' : 'ADD_CHAPTER';
      const bodyPayload = editingChapter
        ? {
            id: syllabusSubject.id,
            action,
            chapterId: editingChapter.id,
            chapter: {
              chapterNumber: parseInt(chapterNumber, 10) || 1,
              title: chapterTitle.trim(),
              description: chapterDesc.trim(),
            },
          }
        : {
            id: syllabusSubject.id,
            action,
            chapter: {
              chapterNumber: parseInt(chapterNumber, 10) || 1,
              title: chapterTitle.trim(),
              description: chapterDesc.trim(),
            },
          };

      const res = await fetch('/api/academics/subjects', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save chapter');
      }

      success(editingChapter ? 'Chapter updated!' : 'Chapter added to syllabus!');
      setChapterModalOpen(false);
      loadData();
    } catch (err: any) {
      toastError(err.message || 'Error saving chapter');
    } finally {
      setSubmittingChapter(false);
    }
  };

  const handleDeleteChapter = async (chapterId: string) => {
    if (!syllabusSubject) return;
    try {
      const res = await fetch('/api/academics/subjects', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: syllabusSubject.id,
          action: 'DELETE_CHAPTER',
          chapterId,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete chapter');
      }

      success('Chapter removed from syllabus.');
      loadData();
    } catch (err: any) {
      toastError(err.message || 'Error deleting chapter');
    }
  };

  // -------------------------------------------------------------
  // TOPIC HANDLERS
  // -------------------------------------------------------------
  const handleOpenAddTopic = (chId: string) => {
    setTargetChapterId(chId);
    setEditingTopic(null);
    setTopicTitle('');
    setTopicLectures('2');
    setTopicNotes('');
    setTopicModalOpen(true);
  };

  const handleOpenEditTopic = (chId: string, topic: TopicRecord) => {
    setTargetChapterId(chId);
    setEditingTopic(topic);
    setTopicTitle(topic.title);
    setTopicLectures(topic.estimatedLectures?.toString() || '2');
    setTopicNotes(topic.notes || '');
    setTopicModalOpen(true);
  };

  const handleSaveTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!syllabusSubject || !targetChapterId || !topicTitle.trim()) return;

    setSubmittingTopic(true);
    try {
      const action = editingTopic ? 'UPDATE_TOPIC' : 'ADD_TOPIC';
      const bodyPayload = editingTopic
        ? {
            id: syllabusSubject.id,
            action,
            chapterId: targetChapterId,
            topicId: editingTopic.id,
            topic: {
              title: topicTitle.trim(),
              estimatedLectures: parseInt(topicLectures, 10) || 1,
              notes: topicNotes.trim(),
            },
          }
        : {
            id: syllabusSubject.id,
            action,
            chapterId: targetChapterId,
            topic: {
              title: topicTitle.trim(),
              estimatedLectures: parseInt(topicLectures, 10) || 1,
              notes: topicNotes.trim(),
            },
          };

      const res = await fetch('/api/academics/subjects', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save topic');
      }

      success(editingTopic ? 'Topic updated!' : 'Topic added to chapter!');
      setTopicModalOpen(false);
      loadData();
    } catch (err: any) {
      toastError(err.message || 'Error saving topic');
    } finally {
      setSubmittingTopic(false);
    }
  };

  const handleDeleteTopic = async (chapterId: string, topicId: string) => {
    if (!syllabusSubject) return;
    try {
      const res = await fetch('/api/academics/subjects', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: syllabusSubject.id,
          action: 'DELETE_TOPIC',
          chapterId,
          topicId,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete topic');
      }

      success('Topic removed.');
      loadData();
    } catch (err: any) {
      toastError(err.message || 'Error deleting topic');
    }
  };

  return (
    <Box sx={{ pb: 6 }}>
      <PageHeader
        title="Subjects Catalog &amp; Syllabus"
        action={
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={handleOpenCreate}
            sx={{
              height: 42,
              px: 2.5,
              fontWeight: 700,
              bgcolor: '#1748D1',
              '&:hover': { bgcolor: '#092B91' },
            }}
          >
            Add Subject
          </Button>
        }
      />

      {/* Class Level Segmented Filter Bar */}
      <Box
        sx={{
          mb: 3.5,
          p: 1.5,
          bgcolor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          display: 'flex',
          gap: 1,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 800, color: '#061B57', mr: 1, pl: 0.5 }}>
          Class Level:
        </Typography>

        <Chip
          clickable
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <span>All Classes</span>
              <Box
                component="span"
                sx={{
                  px: 0.8,
                  py: 0.1,
                  borderRadius: '10px',
                  bgcolor: selectedClassId === 'ALL' ? '#092B91' : '#E2E8F0',
                  color: selectedClassId === 'ALL' ? '#FFFFFF' : '#475569',
                  fontSize: '11px',
                  fontWeight: 800,
                }}
              >
                {subjects.length}
              </Box>
            </Box>
          }
          onClick={() => setSelectedClassId('ALL')}
          sx={{
            height: 34,
            fontWeight: selectedClassId === 'ALL' ? 800 : 600,
            bgcolor: selectedClassId === 'ALL' ? '#1748D1' : 'transparent',
            color: selectedClassId === 'ALL' ? '#FFFFFF' : '#334155',
            border: `1px solid ${selectedClassId === 'ALL' ? '#1748D1' : '#CBD5E1'}`,
            '&:hover': {
              bgcolor: selectedClassId === 'ALL' ? '#092B91' : '#F1F5F9',
            },
          }}
        />

        {classes.map((cls) => {
          const count = subjects.filter((s) => s.classLevelId === cls.id).length;
          const isSelected = selectedClassId === cls.id;
          return (
            <Chip
              key={cls.id}
              clickable
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <span>{cls.name}</span>
                  <Box
                    component="span"
                    sx={{
                      px: 0.8,
                      py: 0.1,
                      borderRadius: '10px',
                      bgcolor: isSelected ? '#092B91' : '#E2E8F0',
                      color: isSelected ? '#FFFFFF' : '#475569',
                      fontSize: '11px',
                      fontWeight: 800,
                    }}
                  >
                    {count}
                  </Box>
                </Box>
              }
              onClick={() => setSelectedClassId(cls.id)}
              sx={{
                height: 34,
                fontWeight: isSelected ? 800 : 600,
                bgcolor: isSelected ? '#1748D1' : 'transparent',
                color: isSelected ? '#FFFFFF' : '#334155',
                border: `1px solid ${isSelected ? '#1748D1' : '#CBD5E1'}`,
                '&:hover': {
                  bgcolor: isSelected ? '#092B91' : '#F1F5F9',
                },
              }}
            />
          );
        })}
      </Box>

      {/* Subjects Table (No Card background) */}
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: '12px',
          border: `1px solid ${ispColors.border.default}`,
          boxShadow: 'none',
        }}
      >
        <Table sx={{ minWidth: 750 }}>
          <TableHead sx={{ bgcolor: '#F8FAFC' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, fontSize: '13px', py: 1.8 }}>Subject Name &amp; Code</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '13px' }}>Class Level</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '13px' }}>Department</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '13px' }}>Status</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, fontSize: '13px' }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredSubjects.map((sub) => {
              const deptStyle = DEPARTMENT_CONFIG[sub.department] || DEPARTMENT_CONFIG.GENERAL;

              return (
                <TableRow key={sub.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  {/* Subject Name & Code */}
                  <TableCell sx={{ py: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#061B57', fontSize: '14.5px' }}>
                      {sub.name}
                    </Typography>
                    <Chip
                      label={sub.code}
                      size="small"
                      sx={{
                        mt: 0.4,
                        height: 20,
                        fontWeight: 800,
                        fontSize: '11px',
                        bgcolor: '#EEF4FF',
                        color: '#1748D1',
                        border: '1px solid #C7D7FE',
                      }}
                    />
                  </TableCell>

                  {/* Class Level */}
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                      <SchoolRoundedIcon sx={{ fontSize: 16, color: '#1748D1' }} />
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#061B57' }}>
                        {sub.classLevelName || 'Class Level'}
                      </Typography>
                    </Box>
                  </TableCell>

                  {/* Department */}
                  <TableCell>
                    <Chip
                      label={deptStyle.label}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        fontSize: '11px',
                        bgcolor: deptStyle.bg,
                        color: deptStyle.color,
                        border: `1px solid ${deptStyle.border}`,
                      }}
                    />
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <StatusChip status={sub.isActive ? 'ACTIVE' : 'INACTIVE'} />
                      <Tooltip title={sub.isActive ? 'Pause Subject' : 'Activate Subject'}>
                        <Switch
                          size="small"
                          checked={sub.isActive}
                          onChange={() => handleToggleStatus(sub)}
                          color="primary"
                        />
                      </Tooltip>
                    </Box>
                  </TableCell>

                  {/* Actions */}
                  <TableCell align="right">
                    <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'flex-end' }}>
                      <Tooltip title="Manage Syllabus (Chapters & Topics)">
                        <IconButton
                          size="small"
                          onClick={() => setSyllabusSubject(sub)}
                          sx={{ color: '#1748D1', '&:hover': { bgcolor: '#EEF4FF' } }}
                        >
                          <MenuBookRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Edit Subject Details">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenEdit(sub)}
                          sx={{ color: '#061B57', '&:hover': { bgcolor: '#F1F5F9' } }}
                        >
                          <EditRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Delete Subject">
                        <IconButton
                          size="small"
                          onClick={() => setDeleteItem(sub)}
                          sx={{ color: '#EF4444', '&:hover': { bgcolor: '#FEE2E2' } }}
                        >
                          <DeleteOutlineRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })}

            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    Loading subjects from database...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : filteredSubjects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                  <Box sx={{ maxWidth: 380, mx: 'auto', textAlign: 'center' }}>
                    <AutoStoriesRoundedIcon sx={{ fontSize: 48, color: '#94A3B8', mb: 1.5 }} />
                    <Typography variant="h6" sx={{ color: '#061B57', fontWeight: 800, mb: 0.5 }}>
                      No Subjects Found
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, fontSize: '13.5px' }}>
                      {selectedClassId !== 'ALL'
                        ? 'No subjects registered under this class level yet.'
                        : 'Create academic subjects and organize their syllabus with chapters and topics.'}
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddRoundedIcon />}
                      onClick={handleOpenCreate}
                      sx={{ bgcolor: '#1748D1', fontWeight: 700 }}
                    >
                      Add Subject
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ============================================================= */}
      {/* ULTRA-POLISHED SYLLABUS DRAWER (CHAPTERS & TOPICS)            */}
      {/* ============================================================= */}
      <Drawer
        anchor="right"
        open={Boolean(syllabusSubject)}
        onClose={() => setSyllabusSubject(null)}
        slotProps={{ backdrop: { sx: { backdropFilter: 'blur(2px)' } } }}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 640 },
            display: 'flex',
            flexDirection: 'column',
            bgcolor: '#F8FAFC',
          },
        }}
      >
        {syllabusSubject && (
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Drawer Header (Sticky) */}
            <Box
              sx={{
                p: 3,
                bgcolor: '#FFFFFF',
                borderBottom: '1px solid #E2E8F0',
                position: 'sticky',
                top: 0,
                zIndex: 10,
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#061B57', fontSize: '18px' }}>
                    {syllabusSubject.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    <Chip
                      label={syllabusSubject.code}
                      size="small"
                      sx={{
                        fontWeight: 800,
                        fontSize: '11px',
                        bgcolor: '#EEF4FF',
                        color: '#1748D1',
                        border: '1px solid #C7D7FE',
                      }}
                    />
                    <Chip
                      icon={<SchoolRoundedIcon sx={{ fontSize: '14px !important' }} />}
                      label={syllabusSubject.classLevelName}
                      size="small"
                      sx={{ fontWeight: 700, fontSize: '11px', bgcolor: '#F1F5F9', color: '#334155' }}
                    />
                  </Box>
                </Box>
                <IconButton
                  onClick={() => setSyllabusSubject(null)}
                  size="small"
                  sx={{
                    bgcolor: '#F1F5F9',
                    '&:hover': { bgcolor: '#E2E8F0' },
                  }}
                >
                  <CloseRoundedIcon fontSize="small" />
                </IconButton>
              </Box>

              {/* KPI Summary Banner */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 1.5,
                  p: 1.5,
                  bgcolor: '#F8FAFC',
                  borderRadius: '10px',
                  border: '1px solid #E2E8F0',
                }}
              >
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                    CHAPTERS
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#1748D1', mt: -0.2 }}>
                    {syllabusSubject.syllabus?.length || 0}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center', borderLeft: '1px solid #E2E8F0', borderRight: '1px solid #E2E8F0' }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                    TOPICS
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#061B57', mt: -0.2 }}>
                    {syllabusSubject.syllabus?.reduce((acc, ch) => acc + ch.topics.length, 0) || 0}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                    TOTAL LECTURES
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#065F46', mt: -0.2 }}>
                    {syllabusSubject.syllabus?.reduce(
                      (acc, ch) => acc + ch.topics.reduce((tAcc, t) => tAcc + (t.estimatedLectures || 1), 0),
                      0
                    ) || 0}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Drawer Body (Scrollable) */}
            <Box sx={{ p: 3, flex: 1, overflowY: 'auto' }}>
              {/* Action Toolbar */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#061B57' }}>
                  Curriculum Chapters
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<PostAddRoundedIcon />}
                  onClick={handleOpenAddChapter}
                  sx={{
                    bgcolor: '#1748D1',
                    fontWeight: 700,
                    fontSize: '12px',
                    height: 34,
                    '&:hover': { bgcolor: '#092B91' },
                  }}
                >
                  Add Chapter
                </Button>
              </Box>

              {/* Chapters List */}
              <Stack spacing={2.5}>
                {syllabusSubject.syllabus?.map((chapter) => (
                  <Card
                    key={chapter.id}
                    sx={{
                      borderRadius: '12px',
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                      bgcolor: '#FFFFFF',
                      overflow: 'visible',
                    }}
                  >
                    <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                      {/* Chapter Header */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: '8px',
                              bgcolor: '#EEF4FF',
                              color: '#1748D1',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                              fontSize: '13px',
                              border: '1px solid #C7D7FE',
                              flexShrink: 0,
                            }}
                          >
                            {chapter.chapterNumber.toString().padStart(2, '0')}
                          </Box>
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#061B57', lineHeight: 1.3 }}>
                              {chapter.title}
                            </Typography>
                            {chapter.description && (
                              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, fontSize: '13px' }}>
                                {chapter.description}
                              </Typography>
                            )}
                          </Box>
                        </Box>

                        <Stack direction="row" spacing={0.5}>
                          <Tooltip title="Edit Chapter">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenEditChapter(chapter)}
                              sx={{ color: '#64748B', '&:hover': { color: '#1748D1', bgcolor: '#EEF4FF' } }}
                            >
                              <EditRoundedIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Chapter">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteChapter(chapter.id)}
                              sx={{ color: '#64748B', '&:hover': { color: '#EF4444', bgcolor: '#FEE2E2' } }}
                            >
                              <DeleteOutlineRoundedIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </Box>

                      {/* Topics Sub-section */}
                      <Box
                        sx={{
                          mt: 2,
                          pt: 2,
                          borderTop: '1px solid #F1F5F9',
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                          <Typography variant="caption" sx={{ fontWeight: 800, color: '#475569', letterSpacing: '0.5px' }}>
                            TOPICS &amp; LECTURES ({chapter.topics?.length || 0})
                          </Typography>
                          <Button
                            size="small"
                            startIcon={<AddRoundedIcon sx={{ fontSize: '14px !important' }} />}
                            onClick={() => handleOpenAddTopic(chapter.id)}
                            sx={{
                              height: 24,
                              fontSize: '11px',
                              fontWeight: 700,
                              textTransform: 'none',
                              color: '#1748D1',
                              bgcolor: '#EEF4FF',
                              '&:hover': { bgcolor: '#E0EAFF' },
                            }}
                          >
                            Add Topic
                          </Button>
                        </Box>

                        {chapter.topics?.length > 0 ? (
                          <Stack spacing={1}>
                            {chapter.topics.map((topic, idx) => (
                              <Box
                                key={topic.id}
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  p: 1.5,
                                  borderRadius: '8px',
                                  bgcolor: '#F8FAFC',
                                  border: '1px solid #F1F5F9',
                                  transition: 'all 0.15s ease',
                                  '&:hover': {
                                    bgcolor: '#FFFFFF',
                                    borderColor: '#CBD5E1',
                                    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                                  },
                                }}
                              >
                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.2 }}>
                                  <Typography
                                    variant="caption"
                                    sx={{ fontWeight: 800, color: '#94A3B8', mt: 0.2, minWidth: 24 }}
                                  >
                                    {chapter.chapterNumber}.{idx + 1}
                                  </Typography>
                                  <Box>
                                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#061B57' }}>
                                      {topic.title}
                                    </Typography>
                                    {topic.notes && (
                                      <Typography
                                        variant="caption"
                                        sx={{ color: 'text.secondary', display: 'block', mt: 0.2, fontSize: '11.5px' }}
                                      >
                                        {topic.notes}
                                      </Typography>
                                    )}
                                  </Box>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0, ml: 2 }}>
                                  <Chip
                                    icon={<AccessTimeRoundedIcon sx={{ fontSize: '12px !important' }} />}
                                    label={`${topic.estimatedLectures || 1} Lec`}
                                    size="small"
                                    sx={{
                                      height: 22,
                                      fontSize: '11px',
                                      fontWeight: 800,
                                      bgcolor: '#EEF4FF',
                                      color: '#1748D1',
                                    }}
                                  />
                                  <IconButton
                                    size="small"
                                    onClick={() => handleOpenEditTopic(chapter.id, topic)}
                                    sx={{ p: 0.5, color: '#64748B', '&:hover': { color: '#1748D1' } }}
                                  >
                                    <EditRoundedIcon sx={{ fontSize: 14 }} />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleDeleteTopic(chapter.id, topic.id)}
                                    sx={{ p: 0.5, color: '#64748B', '&:hover': { color: '#EF4444' } }}
                                  >
                                    <DeleteOutlineRoundedIcon sx={{ fontSize: 14 }} />
                                  </IconButton>
                                </Box>
                              </Box>
                            ))}
                          </Stack>
                        ) : (
                          <Box
                            sx={{
                              p: 2,
                              textAlign: 'center',
                              borderRadius: '8px',
                              border: '1px dashed #CBD5E1',
                              bgcolor: '#F8FAFC',
                            }}
                          >
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                              No topics added yet. Click &ldquo;Add Topic&rdquo; to outline lessons for this chapter.
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                ))}

                {(!syllabusSubject.syllabus || syllabusSubject.syllabus.length === 0) && (
                  <Box
                    sx={{
                      py: 8,
                      px: 3,
                      textAlign: 'center',
                      border: '2px dashed #CBD5E1',
                      borderRadius: '12px',
                      bgcolor: '#FFFFFF',
                    }}
                  >
                    <MenuBookRoundedIcon sx={{ fontSize: 48, color: '#94A3B8', mb: 1.5 }} />
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#061B57', mb: 0.5 }}>
                      Syllabus is Currently Empty
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, fontSize: '13.5px', maxWidth: 360, mx: 'auto' }}>
                      Build the curriculum structure by adding Chapter 1, then break it down into lecture topics.
                    </Typography>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<PostAddRoundedIcon />}
                      onClick={handleOpenAddChapter}
                      sx={{ bgcolor: '#1748D1', fontWeight: 700 }}
                    >
                      Add Chapter 1
                    </Button>
                  </Box>
                )}
              </Stack>
            </Box>
          </Box>
        )}
      </Drawer>

      {/* ============================================================= */}
      {/* ADD / EDIT SUBJECT MODALS                                     */}
      {/* ============================================================= */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleCreateSubject}>
          <DialogTitle component="div" sx={{ fontWeight: 800, color: '#061B57', pb: 1 }}>
            Register New Academic Subject
          </DialogTitle>
          <DialogContent dividers sx={{ py: 2.5 }}>
            <Stack spacing={2.5}>
              <FormControl fullWidth required>
                <InputLabel>Associated Class Level</InputLabel>
                <Select
                  value={classLevelId}
                  label="Associated Class Level"
                  onChange={(e) => setClassLevelId(e.target.value)}
                >
                  {classes.map((cls) => (
                    <MenuItem key={cls.id} value={cls.id}>
                      {cls.name} ({cls.targetExamLabel})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                required
                fullWidth
                label="Subject Name"
                placeholder="e.g. Physics 1st Paper, Higher Mathematics"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <TextField
                required
                fullWidth
                label="Subject Code"
                placeholder="e.g. PHY-101, CHEM-101, H-MATH"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              <FormControl fullWidth>
                <InputLabel>Department / Stream</InputLabel>
                <Select
                  value={department}
                  label="Department / Stream"
                  onChange={(e) => setDepartment(e.target.value as any)}
                >
                  <MenuItem value="SCIENCE">Science</MenuItem>
                  <MenuItem value="COMMERCE">Commerce</MenuItem>
                  <MenuItem value="ARTS">Arts &amp; Humanities</MenuItem>
                  <MenuItem value="GENERAL">General / All Tracks</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                type="number"
                label="Total Weekly Class Sessions"
                placeholder="3"
                value={totalWeeklyClasses}
                onChange={(e) => setTotalWeeklyClasses(e.target.value)}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setOpenDialog(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              sx={{ bgcolor: '#1748D1', fontWeight: 700 }}
            >
              {submitting ? 'Saving...' : 'Save Subject'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Edit Subject Modal */}
      <Dialog open={Boolean(editSubject)} onClose={() => setEditSubject(null)} maxWidth="sm" fullWidth>
        <form onSubmit={handleSaveEdit}>
          <DialogTitle component="div" sx={{ fontWeight: 800, color: '#061B57', pb: 1 }}>
            Edit Subject Details
          </DialogTitle>
          <DialogContent dividers sx={{ py: 2.5 }}>
            <Stack spacing={2.5}>
              <FormControl fullWidth required>
                <InputLabel>Associated Class Level</InputLabel>
                <Select
                  value={editClassLevelId}
                  label="Associated Class Level"
                  onChange={(e) => setEditClassLevelId(e.target.value)}
                >
                  {classes.map((cls) => (
                    <MenuItem key={cls.id} value={cls.id}>
                      {cls.name} ({cls.targetExamLabel})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                required
                fullWidth
                label="Subject Name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
              <TextField
                required
                fullWidth
                label="Subject Code"
                value={editCode}
                onChange={(e) => setEditCode(e.target.value)}
              />
              <FormControl fullWidth>
                <InputLabel>Department / Stream</InputLabel>
                <Select
                  value={editDepartment}
                  label="Department / Stream"
                  onChange={(e) => setEditDepartment(e.target.value as any)}
                >
                  <MenuItem value="SCIENCE">Science</MenuItem>
                  <MenuItem value="COMMERCE">Commerce</MenuItem>
                  <MenuItem value="ARTS">Arts &amp; Humanities</MenuItem>
                  <MenuItem value="GENERAL">General / All Tracks</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                type="number"
                label="Total Weekly Class Sessions"
                value={editTotalWeeklyClasses}
                onChange={(e) => setEditTotalWeeklyClasses(e.target.value)}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setEditSubject(null)} disabled={submittingEdit}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submittingEdit}
              sx={{ bgcolor: '#1748D1', fontWeight: 700 }}
            >
              {submittingEdit ? 'Updating...' : 'Update Subject'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Subject Confirmation */}
      <Dialog open={Boolean(deleteItem)} onClose={() => setDeleteItem(null)} maxWidth="xs" fullWidth>
        <DialogTitle component="div" sx={{ fontWeight: 800, color: '#EF4444', pb: 1 }}>
          Delete Subject
        </DialogTitle>
        <DialogContent dividers sx={{ py: 2.5 }}>
          {deleteItem && (
            <Stack spacing={2}>
              <Typography variant="body2">
                Are you sure you want to permanently delete <strong>{deleteItem.name}</strong> ({deleteItem.code})?
              </Typography>
              <Alert severity="warning" sx={{ borderRadius: '8px', fontSize: '12.5px' }}>
                This will delete its syllabus (all chapters and topics) and class schedules.
              </Alert>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5 }}>
          <Button onClick={() => setDeleteItem(null)} disabled={submittingDelete}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
            disabled={submittingDelete}
            sx={{ fontWeight: 700 }}
          >
            {submittingDelete ? 'Deleting...' : 'Delete Permanently'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ============================================================= */}
      {/* CHAPTER ADD / EDIT DIALOG                                     */}
      {/* ============================================================= */}
      <Dialog open={chapterModalOpen} onClose={() => setChapterModalOpen(false)} maxWidth="xs" fullWidth>
        <form onSubmit={handleSaveChapter}>
          <DialogTitle component="div" sx={{ fontWeight: 800, color: '#061B57', pb: 1 }}>
            {editingChapter ? 'Edit Chapter' : 'Add Chapter to Syllabus'}
          </DialogTitle>
          <DialogContent dividers sx={{ py: 2.5 }}>
            <Stack spacing={2}>
              <TextField
                required
                fullWidth
                type="number"
                label="Chapter Number"
                value={chapterNumber}
                onChange={(e) => setChapterNumber(e.target.value)}
              />
              <TextField
                required
                fullWidth
                label="Chapter Title"
                placeholder="e.g. Dynamics &amp; Circular Motion"
                value={chapterTitle}
                onChange={(e) => setChapterTitle(e.target.value)}
              />
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Description / Scope"
                placeholder="Brief outline of concepts covered in this chapter"
                value={chapterDesc}
                onChange={(e) => setChapterDesc(e.target.value)}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 2.5, py: 1.5 }}>
            <Button onClick={() => setChapterModalOpen(false)} disabled={submittingChapter}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submittingChapter}
              sx={{ bgcolor: '#1748D1', fontWeight: 700 }}
            >
              {submittingChapter ? 'Saving...' : editingChapter ? 'Update Chapter' : 'Add Chapter'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* ============================================================= */}
      {/* TOPIC ADD / EDIT DIALOG                                       */}
      {/* ============================================================= */}
      <Dialog open={topicModalOpen} onClose={() => setTopicModalOpen(false)} maxWidth="xs" fullWidth>
        <form onSubmit={handleSaveTopic}>
          <DialogTitle component="div" sx={{ fontWeight: 800, color: '#061B57', pb: 1 }}>
            {editingTopic ? 'Edit Topic' : 'Add Topic to Chapter'}
          </DialogTitle>
          <DialogContent dividers sx={{ py: 2.5 }}>
            <Stack spacing={2}>
              <TextField
                required
                fullWidth
                label="Topic Title"
                placeholder="e.g. Newton's Laws of Motion &amp; Applications"
                value={topicTitle}
                onChange={(e) => setTopicTitle(e.target.value)}
              />
              <TextField
                fullWidth
                type="number"
                label="Estimated Class Lectures"
                placeholder="2"
                value={topicLectures}
                onChange={(e) => setTopicLectures(e.target.value)}
              />
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Key Concepts / Notes"
                placeholder="e.g. Focus on mathematical derivations and board exam problems"
                value={topicNotes}
                onChange={(e) => setTopicNotes(e.target.value)}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 2.5, py: 1.5 }}>
            <Button onClick={() => setTopicModalOpen(false)} disabled={submittingTopic}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submittingTopic}
              sx={{ bgcolor: '#1748D1', fontWeight: 700 }}
            >
              {submittingTopic ? 'Saving...' : editingTopic ? 'Update Topic' : 'Add Topic'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
