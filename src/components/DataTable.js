"use client";

import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Search, FilterList } from "@mui/icons-material";

export default function DataTable({
  data,
  columns,
  searchFields = [],
  filterOptions = [],
  actions = [],
  title = "Data Table",
  loading = false,
}) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10); // Fixed to 10 as per requirements
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({});

  // Filter data based on search and filters
  const filteredData = useMemo(() => {
    let filtered = data;

    // Apply search
    if (search) {
      filtered = filtered.filter((row) =>
        searchFields.some((field) => {
          const value = row[field];
          if (value === null || value === undefined) return false;
          return String(value).toLowerCase().includes(search.toLowerCase());
        })
      );
    }

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "") {
        filtered = filtered.filter((row) => {
          const rowValue = row[key];
          if (rowValue === null || rowValue === undefined) return false;
          return String(rowValue) === String(value);
        });
      }
    });

    return filtered;
  }, [data, search, filters, searchFields]);

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredData.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(0);
  };

  const getStatusColor = (status) => {
    const statusColors = {
      todo: "warning",
      "in-progress": "info",
      done: "success",
      user: "primary",
      admin: "secondary",
    };
    return statusColors[status] || "default";
  };

  const renderCellValue = (value, column) => {
    if (value === null || value === undefined) return "-";

    switch (column.type) {
      case "status":
        return (
          <Chip
            label={value}
            color={getStatusColor(value)}
            size="small"
            variant="outlined"
          />
        );
      case "date":
        if (value instanceof Date) {
          return value.toLocaleDateString();
        }
        if (value && value.toDate) {
          return value.toDate().toLocaleDateString();
        }
        return value;
      case "truncate":
        const stringValue = String(value);
        return stringValue.length > 50
          ? `${stringValue.substring(0, 50)}...`
          : stringValue;
      default:
        return value;
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Total: {filteredData.length} items
        </Typography>
      </Box>

      {/* Search and Filters */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
          {/* Search */}
          {searchFields.length > 0 && (
            <TextField
              size="small"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: "text.secondary" }} />,
              }}
              sx={{ minWidth: 200 }}
            />
          )}

          {/* Filters */}
          {filterOptions.map((option) => (
            <FormControl key={option.key} size="small" sx={{ minWidth: 120 }}>
              <InputLabel>{option.label}</InputLabel>
              <Select
                value={filters[option.key] || ""}
                onChange={(e) => handleFilterChange(option.key, e.target.value)}
                label={option.label}
                startAdornment={<FilterList sx={{ mr: 1, color: "text.secondary" }} />}
              >
                <MenuItem value="">All</MenuItem>
                {option.values.map((value) => (
                  <MenuItem key={value} value={value}>
                    {value}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ))}
        </Stack>
      </Box>

      {/* Table */}
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.key}
                  align={column.align || "left"}
                  sx={{ fontWeight: "bold" }}
                >
                  {column.label}
                </TableCell>
              ))}
              {actions.length > 0 && (
                <TableCell align="right" sx={{ fontWeight: "bold" }}>
                  Actions
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((row, index) => (
              <TableRow key={row.id || index} hover>
                {columns.map((column) => (
                  <TableCell key={column.key} align={column.align || "left"}>
                    {renderCellValue(row[column.key], column)}
                  </TableCell>
                ))}
                {actions.length > 0 && (
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      {actions.map((action, actionIndex) => (
                        <Tooltip key={actionIndex} title={action.tooltip || action.label}>
                          <IconButton
                            size="small"
                            color={action.color || "primary"}
                            onClick={() => action.onClick(row)}
                            disabled={action.disabled?.(row)}
                          >
                            {action.icon}
                          </IconButton>
                        </Tooltip>
                      ))}
                    </Stack>
                  </TableCell>
                )}
              </TableRow>
            ))}
            
            {paginatedData.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length + (actions.length > 0 ? 1 : 0)} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                    {search || Object.values(filters).some(f => f !== "") 
                      ? "No results found for your search/filters." 
                      : "No data available."}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        component="div"
        count={filteredData.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[10]} // Fixed to 10 as per requirements
        labelRowsPerPage="Rows per page:"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} of ${count !== -1 ? count : `more than ${to}`}`
        }
      />
    </Paper>
  );
}
