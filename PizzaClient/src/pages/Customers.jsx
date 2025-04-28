// Customers.jsx
import React from "react";
import { PageContainer } from "@toolpad/core/PageContainer";
import { Box, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { users } from "../constants/mockData";

const Customers = () => {
  const userRows = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    address: u.address,
    phone: u.phone,
  }));

  const userColumns = [
    { field: "id", headerName: "ID", width: 80 },
    { field: "name", headerName: "Name", flex: 1, minWidth: 160 },
    { field: "email", headerName: "Email", flex: 1, minWidth: 180 },
    { field: "address", headerName: "Address", flex: 1, minWidth: 200 },
    { field: "phone", headerName: "Phone", width: 140 },
  ];

  return (
    <PageContainer
      sx={{
        display: "flex",
        flexDirection: "column",
        p: 0,
      }}
    >
      <Box
        sx={{
          p: 3,
          pb: 0,
          borderBottom: "1px solid",
          borderColor: "divider",
          position: "sticky",
          top: 0,
          zIndex: 1100,
          bgcolor: (theme) => theme.palette.background.default,
        }}
      >
        <Typography variant="h5">Customers</Typography>
      </Box>
      <Box sx={{ flexGrow: 1, height: "calc(100vh - 160px)", p: 3, pt: 2 }}>
        <DataGrid
          rows={userRows}
          columns={userColumns}
          pageSizeOptions={[5, 10, 25]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          autoHeight
          sx={{
            "& .MuiDataGrid-columnHeaders": {
              bgcolor: (theme) =>
                theme.palette.mode === "dark"
                  ? "rgba(30,30,30,0.95)"
                  : "rgba(255,255,255,0.95)",
              position: "sticky",
              top: 0,
            },
          }}
          disableRowSelectionOnClick
        />
      </Box>
    </PageContainer>
  );
};

export default Customers;