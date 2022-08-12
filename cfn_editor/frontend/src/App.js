import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import FolderIcon from '@mui/icons-material/Folder';
import FileIcon from '@mui/icons-material/Description';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { DataGrid } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import FileOpenIcon from '@mui/icons-material/FileOpen';
import DeleteIcon from '@mui/icons-material/Delete';
import { MenuItem } from '@mui/material';

import * as config from "./config"

const drawerWidth = 240;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
  }),
);

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));


function PersistentDrawerLeft() {
  const theme = useTheme();
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const handleDrawerOpen = () => {
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  const [newProjectDialogOpen, setNewProjectDialogOpen] = React.useState(false);
  const [openProjectDialogOpen, setOpenProjectDialogOpen] = React.useState(false);
  const [deleteProjectDialogOpen, setDeleteProjectDialogOpen] = React.useState(false);
  const [newTemplateDialogOpen, setNewTemplateDialogOpen] = React.useState(false);
  const [openTemplateDialogOpen, setOpenTemplateDialogOpen] = React.useState(false);
  const [deleteTemplateDialogOpen, setDeleteTemplateDialogOpen] = React.useState(false);

  const [tmpProjectName, setTmpProjectName] = React.useState("")
  const [tmpProjectNameError, setTmpProjectNameError] = React.useState(false)
  const [existedProjectNames, setExistedProjectNames] = React.useState([])
  const [selectedProjectName, setSelectedProjectName] = React.useState("")

  const [tmpTemplate, setTmpTemplate] = React.useState({"Name": "", "File": null})
  const [tmpTemplateError, setTmpTemplateError] = React.useState(false)
  const [existedTemplateNames, setExistedTemplateNames] = React.useState([])
  const [selectedTemplate, setSelectedTemplate] = React.useState({"Name": "", "Body": null})


  const handleTmpProjectName = (e) => {
    setTmpProjectName(e.target.value)
  }
  const handletmpTemplate = (nameEvent, fileEvent) => {
    var newTemplate = {"Name": tmpTemplate["Name"], "File": tmpTemplate["File"]}
    if (nameEvent !== null) {
      newTemplate["Name"] = nameEvent.target.value
      newTemplate["File"] = null
    }

    if (fileEvent !== null) {
      newTemplate["File"] = fileEvent.target.files[0]
      newTemplate["Name"] = fileEvent.target.files[0].name
    }

    console.log(newTemplate)
    setTmpTemplate(newTemplate)
  }

  const handleNewProjectDialogOpen = () => {
    setNewProjectDialogOpen(true);
  };
  const handleNewProjectDialogClose = (submit) => {
    if (submit === true) {
      console.log(tmpProjectName)
      if (tmpProjectName.length === 0) {
        setTmpProjectNameError(true)
        return
      }
      const url = config.BASE_URL + "project"
      const option = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({"Name": tmpProjectName}),
      }
      fetch(url, option)
      .then(res => res.json())
      .then((body) => {
        setSelectedProjectName(body["Name"])
      })
      .catch(e => console.error(e))
    }
    setTmpProjectNameError(false)
    setNewProjectDialogOpen(false);

    return

  };
  const handleOpenProjectDialogOpen = () => {
    const url = config.BASE_URL + "project"
    fetch(url)
    .then(res => res.json())
    .then(body => {
      console.log(body)
      setExistedProjectNames(body["Projects"].map(project => project["Name"]))
    })
    .catch(e => console.error(e))
    setOpenProjectDialogOpen(true);
  }
  const handleOpenProjectDialogClose = (submit) => {
    if (submit === true) {
      setSelectedProjectName(tmpProjectName)
    }

    setOpenProjectDialogOpen(false);
  }
  const handleDeleteProjectDialogOpen = () => {
    const url = config.BASE_URL + "project"
    fetch(url)
    .then(res => res.json())
    .then(body => {
      console.log(body)
      setExistedProjectNames(body["Projects"].map(project => project["Name"]))
    })
    .catch(e => console.error(e))
    setDeleteProjectDialogOpen(true);
  }
  const handleDeleteProjectDialogClose = (submit) => {
    if (submit === true) {
      console.log(tmpProjectName)
      if (tmpProjectName.length === 0) {
        setTmpProjectNameError(true)
        return
      }
      const url = config.BASE_URL + "project"
      const option = {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({"Name": tmpProjectName}),
      }
      fetch(url, option)
      .then(res => res.json())
      .then((body) => {
        console.log(body)
        if (body["Name"] === selectedProjectName) {
          setSelectedProjectName("")
        } 
      })
      .catch(e => console.error(e))
    }

    setDeleteProjectDialogOpen(false);
  }


  const handleNewTemplateDialogOpen = () => {
    setNewTemplateDialogOpen(true);
  };
  const handleNewTemplateDialogClose = (submit) => {
    if (submit === true) {
      console.log(tmpTemplate)
      if (tmpTemplate["Name"].length === 0) {
        setTmpTemplateError(true)
        return
      }

      var file
      if (tmpTemplate["File"] === null) {
        file = new File(
          [config.EMPTY_TEMPLATE_STR],
          tmpTemplate["Name"],
        )
      } else {
        file = tmpTemplate["File"]
      }

      const url = config.BASE_URL + `project/${selectedProjectName}/template`
      const body = new FormData()
      body.append("file", file)
      body.append("name", tmpTemplate["Name"])
      const option = {
        method: 'POST',
        headers: {
          // 'Content-Type': 'multipart/form-data',
        },
        body: body,
      }

      fetch(url, option)
      .then(res => res.json())
      .then((body) => {
        setSelectedTemplate(body)
        console.log(body)
      })
      .catch(e => console.error(e))
    }
    setNewTemplateDialogOpen(false);
  };

  const handleOpenTemplateDialogOpen = () => {
    const url = config.BASE_URL + `project/${selectedProjectName}/template`
    fetch(url)
    .then(res => res.json())
    .then(body => {
      console.log(body)
      setExistedTemplateNames(body["Templates"].map(template => template["Name"]))
    })
    .catch(e => console.error(e))

    setOpenTemplateDialogOpen(true);
  }

  const handleOpenTemplateDialogClose = (submit) => {
    if (submit === true) {
      const url = config.BASE_URL + `project/${selectedProjectName}/template/${tmpTemplate["Name"]}`
      fetch(url)
      .then(res => res.json())
      .then(body => {
        setSelectedTemplate(body)
      })
      .catch(e => console.error(e))
    }

    setOpenTemplateDialogOpen(false);
  }

  const handleDeleteTemplateDialogOpen = () => {
    const url = config.BASE_URL + `project/${selectedProjectName}/template`
    fetch(url)
    .then(res => res.json())
    .then(body => {
      console.log(body)
      setExistedTemplateNames(body["Templates"].map(template => template["Name"]))
    })
    .catch(e => console.error(e))

    setDeleteTemplateDialogOpen(true);
  }
  const handleDeleteTemplateDialogClose = (submit) => {
    if (submit === true) {
      const url = config.BASE_URL +`project/${selectedProjectName}/template`
      const option = {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({"Name": tmpTemplate["Name"]}),
      }
      fetch(url, option)
      .then(res => res.json())
      .then(body => {
        if (body["Name"] === selectedTemplate["Name"]) {
          setSelectedTemplate({"Name": "", "Body": null})
        }
      })
      .catch(e => console.error(e))
    }

    setDeleteTemplateDialogOpen(false);
  }


  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" open={drawerOpen}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{ mr: 2, ...(drawerOpen && { display: 'none' }) }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            cfn-editor {
              selectedProjectName !== "" ? ` > ${selectedProjectName}` : ""
            } {selectedTemplate["Name"] !== "" ? ` > ${selectedTemplate["Name"]}` : ""} 
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="persistent"
        anchor="left"
        open={drawerOpen}
      >
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </DrawerHeader>
        {/* <Divider/> */}
        <List>
          <Divider component="li" />
            <li>
              <Typography
                sx={{ mt: 0.5, ml: 2 }}
                // color="text.secondary"
                display="block"
                // variant="caption"
              >
                Projects
              </Typography>
            </li>
            <ListItem key="NewProject" disablePadding>
              <ListItemButton onClick={handleNewProjectDialogOpen}>
                <ListItemIcon>
                  <AddIcon/>
                </ListItemIcon>
                <ListItemText primary="New" />
              </ListItemButton>
            </ListItem>
            <ListItem key="OpenProject" disablePadding>
              <ListItemButton onClick={handleOpenProjectDialogOpen}>
                <ListItemIcon>
                  <FileOpenIcon/>
                </ListItemIcon>
                <ListItemText primary="Open" />
              </ListItemButton>
            </ListItem>
            <ListItem key="DeleteProject" disablePadding>
              <ListItemButton onClick={handleDeleteProjectDialogOpen}>
                <ListItemIcon>
                  <DeleteIcon/>
                </ListItemIcon>
                <ListItemText primary="Delete" />
              </ListItemButton>
            </ListItem>
        </List>
        <List>
          <Divider component="li" />
            <li>
              <Typography
                sx={{ mt: 0.5, ml: 2 }}
                // color="text.secondary"
                display="block"
                // variant="caption"
              >
                Templates
              </Typography>
            </li>
            <ListItem key="NewTemplate" disablePadding>
              <ListItemButton onClick={handleNewTemplateDialogOpen}>
                <ListItemIcon>
                  <AddIcon/>
                </ListItemIcon>
                <ListItemText primary="New" />
              </ListItemButton>
            </ListItem>
            <ListItem key="OpenTemplate" disablePadding>
              <ListItemButton onClick={handleOpenTemplateDialogOpen}>
                <ListItemIcon>
                  <FileOpenIcon/>
                </ListItemIcon>
                <ListItemText primary="Open" />
              </ListItemButton>
            </ListItem>
            <ListItem key="DeleteTemplate" disablePadding>
              <ListItemButton onClick={handleDeleteTemplateDialogOpen}>
                <ListItemIcon>
                  <DeleteIcon/>
                </ListItemIcon>
                <ListItemText primary="Delete" />
              </ListItemButton>
            </ListItem>
        </List>
        <Divider />
          <Dialog open={newProjectDialogOpen} onClose={() => handleNewProjectDialogClose(false)}>
            <DialogTitle>Create New Projects</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Create new project.
              </DialogContentText>
              <div style={{ height: 400, width: '100%' }}>
                <TextField
                  error={tmpProjectNameError}
                  autoFocus
                  margin="dense"
                  id="ProjectName"
                  label="Project Name"
                  // type="email"
                  fullWidth
                  variant="standard"
                  onChange={(e) => handleTmpProjectName(e)}
                />
              </div>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => handleNewProjectDialogClose(true)}>New</Button>
            </DialogActions>
          </Dialog>
          <Dialog open={openProjectDialogOpen} onClose={() => handleOpenProjectDialogClose(false)}>
            <DialogTitle>Open Existed Project</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Open existed project.
              </DialogContentText>
              <div style={{ height: 400, width: '100%' }}>
                <TextField
                    autoFocus
                    margin="dense"
                    id="ProjectName"
                    label="Project Name"
                    // type="email"
                    fullWidth
                    variant="standard"
                    select
                    onChange={(e) => handleTmpProjectName(e)}
                  >
                    {existedProjectNames.map((name, i) => {
                      return <MenuItem key={i} value={name}>{name}</MenuItem>
                    })}
                </TextField>
              </div>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => handleOpenProjectDialogClose(true)}>Open</Button>
            </DialogActions>
          </Dialog>
          <Dialog open={deleteProjectDialogOpen} onClose={() => handleDeleteProjectDialogClose(false)}>
            <DialogTitle>Delete Existed Project</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Delete existed project.
              </DialogContentText>
              <div style={{ height: 400, width: '100%' }}>
                <TextField
                    autoFocus
                    margin="dense"
                    id="ProjectName"
                    label="Project Name"
                    // type="email"
                    fullWidth
                    variant="standard"
                    select
                    onChange={(e) => handleTmpProjectName(e)}
                    >
                    {existedProjectNames.map((name, i) => {
                      return <MenuItem key={i} value={name}>{name}</MenuItem>
                    })}
                </TextField>
              </div>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => handleDeleteProjectDialogClose(true)}>Delete</Button>
            </DialogActions>
          </Dialog>

          <Dialog open={newTemplateDialogOpen} onClose={() => handleNewTemplateDialogClose(false)}>
            <DialogTitle>Create New Template</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Create new template.
              </DialogContentText>
              <div style={{ height: 400, width: '100%' }}>
                <TextField
                  autoFocus
                  margin="dense"
                  id="TemplateName"
                  label="Template Name"
                  // type="email"
                  fullWidth
                  variant="standard"
                  value={tmpTemplate["Name"]}
                  onChange={(e) => handletmpTemplate(e, null)}
                />
                <Button
                  variant="contained"
                  component="label"
                  onChange={(e) => handletmpTemplate(null, e)}>
                  IMPORT
                  <input hidden accept=".json,.yaml" multiple type="file" />
                </Button>
              </div>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => handleNewTemplateDialogClose(true)}>New</Button>
            </DialogActions>
          </Dialog>
          <Dialog open={openTemplateDialogOpen} onClose={() => handleOpenTemplateDialogClose(false)}>
            <DialogTitle>Open Existed Template</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Open existed template.
              </DialogContentText>
              <div style={{ height: 400, width: '100%' }}>
                <TextField
                    error={tmpTemplateError}
                    autoFocus
                    margin="dense"
                    id="TemplateName"
                    label="Template Name"
                    // type="email"
                    fullWidth
                    variant="standard"
                    select
                    onChange={(e) => handletmpTemplate(e, null)}
                  >
                    {existedTemplateNames.map((template, i) => {
                      return <MenuItem key={i} value={template}>{template}</MenuItem>
                    })}
                </TextField>
              </div>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => handleOpenTemplateDialogClose(true)}>Open</Button>
            </DialogActions>
          </Dialog>
          <Dialog open={deleteTemplateDialogOpen} onClose={() => handleDeleteTemplateDialogClose(false)}>
            <DialogTitle>Delete Existed Template</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Delete existed template.
              </DialogContentText>
              <div style={{ height: 400, width: '100%' }}>
                <TextField
                    autoFocus
                    margin="dense"
                    id="TemplateName"
                    label="Template Name"
                    // type="email"
                    fullWidth
                    variant="standard"
                    select
                    onChange={(e) => handletmpTemplate(e, null)}
                  >
                    {existedTemplateNames.map((template, i) => {
                      return <MenuItem key={i} value={template}>{template}</MenuItem>
                    })}
                </TextField>
              </div>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => handleDeleteTemplateDialogClose(true)}>Delete</Button>
            </DialogActions>
          </Dialog>

      </Drawer>
      <Main open={drawerOpen}>
        <DrawerHeader />
        <Typography paragraph>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
          tempor incididunt ut labore et dolore magna aliqua. Rhoncus dolor purus non
          enim praesent elementum facilisis leo vel. Risus at ultrices mi tempus
          imperdiet. Semper risus in hendrerit gravida rutrum quisque non tellus.
          Convallis convallis tellus id interdum velit laoreet id donec ultrices.
          Odio morbi quis commodo odio aenean sed adipiscing. Amet nisl suscipit
          adipiscing bibendum est ultricies integer quis. Cursus euismod quis viverra
          nibh cras. Metus vulputate eu scelerisque felis imperdiet proin fermentum
          leo. Mauris commodo quis imperdiet massa tincidunt. Cras tincidunt lobortis
          feugiat vivamus at augue. At augue eget arcu dictum varius duis at
          consectetur lorem. Velit sed ullamcorper morbi tincidunt. Lorem donec massa
          sapien faucibus et molestie ac.
        </Typography>
        <Typography paragraph>
          Consequat mauris nunc congue nisi vitae suscipit. Fringilla est ullamcorper
          eget nulla facilisi etiam dignissim diam. Pulvinar elementum integer enim
          neque volutpat ac tincidunt. Ornare suspendisse sed nisi lacus sed viverra
          tellus. Purus sit amet volutpat consequat mauris. Elementum eu facilisis
          sed odio morbi. Euismod lacinia at quis risus sed vulputate odio. Morbi
          tincidunt ornare massa eget egestas purus viverra accumsan in. In hendrerit
          gravida rutrum quisque non tellus orci ac. Pellentesque nec nam aliquam sem
          et tortor. Habitant morbi tristique senectus et. Adipiscing elit duis
          tristique sollicitudin nibh sit. Ornare aenean euismod elementum nisi quis
          eleifend. Commodo viverra maecenas accumsan lacus vel facilisis. Nulla
          posuere sollicitudin aliquam ultrices sagittis orci a.
        </Typography>
      </Main>
    </Box>
  );
}


function FormDialog() {

}



function App() {
  return (
    <div className="App">
      <PersistentDrawerLeft/>
    </div>
  );
}

export default App;
