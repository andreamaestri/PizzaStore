import { useState } from 'react'
import {
  AppBar, Toolbar, Typography, Box, Drawer, List, ListItem, 
  ListItemIcon, ListItemText, Container, Paper, IconButton, Divider,
  Avatar, useTheme, useMediaQuery
} from '@mui/material'
import {
  LocalPizza as PizzaIcon, 
  Dashboard as DashboardIcon,
  Menu as MenuIcon,
  Receipt as OrdersIcon,
  People as CustomersIcon,
  Settings as SettingsIcon
} from '@mui/icons-material'
import './App.css'
import Pizza from './Pizza'

const drawerWidth = 240

function App() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const drawer = (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
        <Avatar 
          sx={{ 
            width: 60, 
            height: 60, 
            bgcolor: 'primary.main',
            mb: 1
          }}
        >
          <PizzaIcon sx={{ fontSize: 32 }} />
        </Avatar>
        <Typography variant="h6" noWrap component="div" fontWeight="bold">
          Pizza Admin
        </Typography>
      </Box>
      <Divider />
      <List sx={{ py: 1 }}>
        <ListItem button selected sx={{ mb: 0.5 }}>
          <ListItemIcon>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Dashboard" 
            primaryTypographyProps={{ fontWeight: 500 }}
          />
        </ListItem>
        <ListItem button sx={{ mb: 0.5 }}>
          <ListItemIcon>
            <PizzaIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Pizza Menu" 
            primaryTypographyProps={{ fontWeight: 500 }}
          />
        </ListItem>
        <ListItem button sx={{ mb: 0.5 }}>
          <ListItemIcon>
            <OrdersIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Orders" 
            primaryTypographyProps={{ fontWeight: 500 }}
          />
        </ListItem>
        <ListItem button sx={{ mb: 0.5 }}>
          <ListItemIcon>
            <CustomersIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Customers" 
            primaryTypographyProps={{ fontWeight: 500 }}
          />
        </ListItem>
      </List>
      <Divider />
      <List sx={{ py: 1, mt: 'auto' }}>
        <ListItem button>
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Settings" 
            primaryTypographyProps={{ fontWeight: 500 }}
          />
        </ListItem>
      </List>
    </>
  )

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar 
        position="fixed" 
        elevation={1}
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: 'white',
          color: 'text.primary'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {!isMobile && (
              <Avatar 
                sx={{ 
                  bgcolor: 'primary.main', 
                  mr: 2,
                  display: { xs: 'none', sm: 'flex' }
                }}
              >
                <PizzaIcon />
              </Avatar>
            )}
            <Typography variant="h6" noWrap component="div" fontWeight="bold" color="primary.main">
              Pizza Store Admin Dashboard
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1 }} />
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: '1px solid rgba(0, 0, 0, 0.08)'
            },
          }}
        >
          {drawer}
        </Drawer>
        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: '1px solid rgba(0, 0, 0, 0.08)'
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          marginTop: '64px',
          backgroundColor: 'background.default',
          minHeight: 'calc(100vh - 64px)'
        }}
      >
        <Container maxWidth="lg">
          <Paper 
            elevation={0} 
            variant="outlined"
            sx={{ 
              p: 3, 
              mt: 2,
              borderRadius: 2,
              backgroundColor: 'background.paper'
            }}
          >
            <Pizza />
          </Paper>
        </Container>
      </Box>
    </Box>
  )
}

export default App
