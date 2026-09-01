'use client';

import * as React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import PrintRoundedIcon from '@mui/icons-material/PrintRounded';
import PageHeader from '@/components/common/PageHeader';
import StatusChip from '@/components/common/StatusChip';
import { ispColors } from '@/theme/colors';

interface PaymentItem {
  id: string;
  receiptNo: string;
  studentId: string;
  studentName: string;
  batchName: string;
  feeType: string;
  amount: number;
  method: 'CASH' | 'BKASH' | 'NAGAD' | 'BANK';
  receivedBy: string;
  date: string;
}

export default function PaymentsPage() {
  const [payments, setPayments] = React.useState<PaymentItem[]>([
    {
      id: 'p-1',
      receiptNo: 'ISP-2028-000125',
      studentId: '20280001',
      studentName: 'Rahim Ahmed',
      batchName: 'SSC 2027 Science A',
      feeType: 'September Monthly Tuition',
      amount: 2500,
      method: 'BKASH',
      receivedBy: 'Admin Office',
      date: '2028-09-01',
    },
    {
      id: 'p-2',
      receiptNo: 'ISP-2028-000126',
      studentId: '20280003',
      studentName: 'Tanvir Hasan Sadi',
      batchName: 'SSC 2027 Science A',
      feeType: 'Admission Fee + Sep Tuition',
      amount: 3500,
      method: 'CASH',
      receivedBy: 'Chief Director',
      date: '2028-09-01',
    },
    {
      id: 'p-3',
      receiptNo: 'ISP-2028-000127',
      studentId: '20280002',
      studentName: 'Tasnim Jahan Sara',
      batchName: 'HSC 2028 Science',
      feeType: 'September Monthly Tuition',
      amount: 3000,
      method: 'NAGAD',
      receivedBy: 'Admin Office',
      date: '2028-08-31',
    },
  ]);

  const [openCollectDialog, setOpenCollectDialog] = React.useState(false);
  const [studentId, setStudentId] = React.useState('20280004');
  const [amount, setAmount] = React.useState('2500');
  const [paymentMethod, setPaymentMethod] = React.useState<'CASH' | 'BKASH' | 'NAGAD' | 'BANK'>('CASH');
  const [feeType, setFeeType] = React.useState('September Monthly Tuition');
  const [successReceipt, setSuccessReceipt] = React.useState<string | null>(null);

  const handleRecordPayment = () => {
    const num = payments.length + 128;
    const newReceipt = `ISP-2028-000${num}`;
    const newPayment: PaymentItem = {
      id: `p-${num}`,
      receiptNo: newReceipt,
      studentId,
      studentName: 'Mahir Faisal',
      batchName: 'Class 9 Morning A',
      feeType,
      amount: parseFloat(amount),
      method: paymentMethod,
      receivedBy: 'ISP Administrator',
      date: '2028-09-01',
    };

    setPayments([newPayment, ...payments]);
    setSuccessReceipt(newReceipt);
    setOpenCollectDialog(false);
  };

  return (
    <Box>
      <PageHeader
        title="Fee Collections & Receipts"
        subtitle="Manage student billing, process cash/bKash/Nagad collections, and generate printable receipts"
        breadcrumbs={[
          { label: 'Console', href: '/admin/dashboard' },
          { label: 'Finance', href: '/admin/finance/payments' },
          { label: 'Payments' },
        ]}
        action={
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => {
              setOpenCollectDialog(true);
              setSuccessReceipt(null);
            }}
          >
            Collect Payment
          </Button>
        }
      />

      {successReceipt && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: '10px' }}>
          <strong>Payment Received!</strong> Official Receipt generated: <code>{successReceipt}</code>.
        </Alert>
      )}

      {/* Payments Table */}
      <Card>
        <CardContent sx={{ p: 3 }}>
          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: '8px' }}>
            <Table size="medium">
              <TableHead>
                <TableRow>
                  <TableCell>Receipt No</TableCell>
                  <TableCell>Student ID</TableCell>
                  <TableCell>Student Name</TableCell>
                  <TableCell>Fee Category</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Method</TableCell>
                  <TableCell>Received By</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payments.map((p) => (
                  <TableRow key={p.id} hover>
                    <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700, color: ispColors.primary[700] }}>
                      {p.receiptNo}
                    </TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{p.studentId}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{p.studentName}</TableCell>
                    <TableCell>{p.feeType}</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: ispColors.semantic.success.dark }}>
                      ৳ {p.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <StatusChip status={p.method} />
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontSize: '13px' }}>{p.receivedBy}</TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontSize: '13px' }}>{p.date}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Print Official Receipt">
                        <IconButton
                          size="small"
                          onClick={() => alert(`Printing Receipt: ${p.receiptNo}\nStudent: ${p.studentName} (${p.studentId})\nAmount: ৳${p.amount}`)}
                          sx={{ color: ispColors.primary[600] }}
                        >
                          <PrintRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Collect Fee Dialog */}
      <Dialog open={openCollectDialog} onClose={() => setOpenCollectDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Collect Student Fee</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '16px !important' }}>
          <TextField
            label="Student ID"
            fullWidth
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            helperText="Verified student: Mahir Faisal (Class 9 Morning A)"
          />

          <FormControl fullWidth>
            <InputLabel>Fee Type</InputLabel>
            <Select value={feeType} label="Fee Type" onChange={(e) => setFeeType(e.target.value)}>
              <MenuItem value="September Monthly Tuition">September Monthly Tuition (৳2,500)</MenuItem>
              <MenuItem value="Model Test Examination Fee">Model Test Examination Fee (৳500)</MenuItem>
              <MenuItem value="Special Coaching Course Material">Special Coaching Course Material (৳800)</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Amount (BDT)"
            type="number"
            fullWidth
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <FormControl fullWidth>
            <InputLabel>Payment Method</InputLabel>
            <Select
              value={paymentMethod}
              label="Payment Method"
              onChange={(e) => setPaymentMethod(e.target.value as 'CASH' | 'BKASH' | 'NAGAD' | 'BANK')}
            >
              <MenuItem value="CASH">Cash at Desk</MenuItem>
              <MenuItem value="BKASH">bKash Merchant</MenuItem>
              <MenuItem value="NAGAD">Nagad</MenuItem>
              <MenuItem value="BANK">Bank Transfer / Deposit</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenCollectDialog(false)} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleRecordPayment} variant="contained">
            Confirm &amp; Generate Receipt
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
