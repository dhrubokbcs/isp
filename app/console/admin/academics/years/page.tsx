'use client';

import * as React from 'react';
import {
  Box,
  Card,
  CardContent,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import PageHeader from '@/components/common/PageHeader';
import StatusChip from '@/components/common/StatusChip';
import { ispColors } from '@/theme/colors';

interface AcademicYearItem {
  id: string;
  name: string;
  year: number;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'UPCOMING' | 'ARCHIVED';
  nextStudentSerial: number;
  totalBatches: number;
  totalStudents: number;
}

export default function AcademicYearsPage() {
  const [years, setYears] = React.useState<AcademicYearItem[]>([
    {
      id: 'ay-2028',
      name: 'Academic Year 2028',
      year: 2028,
      startDate: '2028-01-01',
      endDate: '2028-12-31',
      status: 'ACTIVE',
      nextStudentSerial: 43, // Next generated student ID will be 20280043
      totalBatches: 18,
      totalStudents: 1284,
    },
    {
      id: 'ay-2027',
      name: 'Academic Year 2027',
      year: 2027,
      startDate: '2027-01-01',
      endDate: '2027-12-31',
      status: 'ARCHIVED',
      nextStudentSerial: 1120,
      totalBatches: 16,
      totalStudents: 1119,
    },
    {
      id: 'ay-2029',
      name: 'Academic Year 2029',
      year: 2029,
      startDate: '2029-01-01',
      endDate: '2029-12-31',
      status: 'UPCOMING',
      nextStudentSerial: 1, // Will start at 20290001
      totalBatches: 0,
      totalStudents: 0,
    },
  ]);

  const [openDialog, setOpenDialog] = React.useState(false);
  const [yearName, setYearName] = React.useState('');
  const [yearNumber, setYearNumber] = React.useState('2030');

  const handleCreateYear = () => {
    if (!yearName || !yearNumber) return;
    const num = parseInt(yearNumber, 10);
    const newYear: AcademicYearItem = {
      id: `ay-${num}`,
      name: yearName,
      year: num,
      startDate: `${num}-01-01`,
      endDate: `${num}-12-31`,
      status: 'UPCOMING',
      nextStudentSerial: 1,
      totalBatches: 0,
      totalStudents: 0,
    };
    setYears([...years, newYear]);
    setOpenDialog(false);
    setYearName('');
  };

  return (
    <Box>
      <PageHeader
        title="Academic Years"
        subtitle="Manage center academic cohorts, active year boundaries, and student sequence serials"
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin/dashboard' },
          { label: 'Academic', href: '/admin/academics/years' },
          { label: 'Academic Years' },
        ]}
        action={
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => setOpenDialog(true)}
          >
            Create Academic Year
          </Button>
        }
      />

      <Card>
        <CardContent sx={{ p: 3 }}>
          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: '8px' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Academic Year</TableCell>
                  <TableCell>Year</TableCell>
                  <TableCell>Date Range</TableCell>
                  <TableCell>Next Student Serial</TableCell>
                  <TableCell>Batches</TableCell>
                  <TableCell>Students</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {years.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell sx={{ fontWeight: 700, fontSize: '15px' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {row.name}
                        {row.status === 'ACTIVE' && (
                          <CheckCircleRoundedIcon sx={{ fontSize: 18, color: ispColors.semantic.success.main }} />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{row.year}</TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>
                      {row.startDate} ~ {row.endDate}
                    </TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700, color: ispColors.primary[700] }}>
                      {`${row.year}${row.nextStudentSerial.toString().padStart(4, '0')}`}
                    </TableCell>
                    <TableCell>{row.totalBatches} Batches</TableCell>
                    <TableCell>{row.totalStudents} Students</TableCell>
                    <TableCell>
                      <StatusChip status={row.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Create Academic Year Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: '20px' }}>
          Create New Academic Year
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '16px !important' }}>
          <TextField
            label="Academic Year Name"
            placeholder="e.g. Academic Year 2030"
            value={yearName}
            onChange={(e) => setYearName(e.target.value)}
            fullWidth
            required
          />
          <TextField
            label="Calendar Year"
            type="number"
            placeholder="2030"
            value={yearNumber}
            onChange={(e) => setYearNumber(e.target.value)}
            fullWidth
            required
          />
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Permanent Student ID sequence will automatically initialize at <code>{yearNumber}0001</code> for this cohort.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenDialog(false)} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleCreateYear} variant="contained">
            Save Academic Year
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
