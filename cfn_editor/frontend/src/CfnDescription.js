import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
// import { makeStyles } from "@mui/styles";
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
import AddIcon from '@mui/icons-material/Add';
import FileOpenIcon from '@mui/icons-material/FileOpen';
import DeleteIcon from '@mui/icons-material/Delete';
import { MenuItem } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';

import Iframe from 'react-iframe'

import * as config from "./config"

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';

import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Switch from '@mui/material/Switch';
import { maxWidth } from '@mui/system';


const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'left',
  color: theme.palette.text.secondary,
}));

const repr = (v) => {
  if (Array.isArray(v)) {
    return v.join(",")
  } else if (typeof v === "boolean") {
    return v ? "TRUE" : "FALSE"
  }

  return v
}

export const Description = ({
  templateName, projectName,
  parameterDefs, setParameterDefs,
  selectedTemplate, setSelectedTemplate,
  selectedProjectName, setselectedProjectName,
  descriptionDef, setDescriptionDef,

}) => {

  const [tmpDescription, setTmpDescription] = React.useState(descriptionDef)

  // React.useEffect(() => {
  // }, [])

  const handleDescriptionChange = (e) => {
    setTmpDescription(e.target.value)
  }
  const handleDescriptionSave = () => {
    var url = config.BASE_API_URL + `project/${selectedProjectName}/template/${selectedTemplate["Name"]}/description`
    var option = {
      method: "POST",
      body: JSON.stringify({Description: tmpDescription})
    }
    fetch(url, option)
    .then(res => res.json())
    .then(body => {
      console.log(body)
      setDescriptionDef(body["Description"])
      setTmpDescription(body["Description"])
    })

  }

  return (
    <Box
      component="form"
      sx={{
        '& .MuiTextField-root': { m: 1 },
      }}
      noValidate
      autoComplete="off"
    >
      <div>
        <TextField
          id="Description"
          label="Description"
          multiline
          maxRows={4}
          value={tmpDescription}
          autoFocus
          fullWidth
          onChange={handleDescriptionChange}
        />
      </div>
      <Grid
        container
        justifyContent={"center"}
      >
        <Button
          style={{ alignItems: 'center', }}
          variant={"contained"}
          startIcon={<SaveIcon />}
          onClick={() => {handleDescriptionSave()}}
        >
          SAVE
        </Button>
      </Grid>
    </Box>
  )


}