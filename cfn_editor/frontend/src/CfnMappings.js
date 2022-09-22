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
// import Autocomplete from '@mui/material/Autocomplete';

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

import Select from '@mui/material/Select';

import Autocomplete from '@mui/material/Autocomplete';

// const filter = createFilterOptions();

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

export const Mappings = ({
  templateName, projectName,
  parameterDefs, setParameterDefs,
  mappingDefs, setMappingDefs,
}) => {

  const emptyMapping = { "Name": "", "Item": "", "Key": "", "Value": "", "_Id": 9999 }

  const mappingFields = ["Name", "Item", "Key", "Value"]

  const [tmpMapping, setTmpMapping] = React.useState({...emptyMapping})
  const [selectedMapping, setSelectedMapping] = React.useState({})

  const [editMappingDialogOpen, setEditMappingDialogOpen] = React.useState(false)


  React.useEffect(() => {
    var url = config.BASE_API_URL + `project/${projectName}/template/${templateName}/mapping`
    fetch(url)
      .then(res => res.json())
      .then(body => {
        setMappingDefs(body["Mappings"])
      })
      .catch(e => console.error(e))

  }, [])

  const handleMappingSelected = (m, i) => {
    setSelectedMapping(m)
    setTmpMapping({...m, "_Id": i})
    setEditMappingDialogOpen(true)
  }


  const handleEditMappingDialogClose = (submit, kind) => {
    if (!submit) {
      setEditMappingDialogOpen(false)
      setTmpMapping({...emptyMapping})
      return
    }

    var newMappingDefs = [...mappingDefs]
    console.log(newMappingDefs)
    console.log(tmpMapping)
    if (kind === "delete") {
      newMappingDefs.splice(tmpMapping["_Id"], 1)

    } else if (kind === "save") {
      const {_Id, ...newMapping} = tmpMapping

      console.log(newMapping)
      newMappingDefs.splice(tmpMapping["_Id"], 1, {...newMapping})
    }
    console.log(tmpMapping)

    console.log(newMappingDefs)
    var url = config.BASE_API_URL + `project/${projectName}/template/${templateName}/mapping`
    var option = {
      method: "POST",
      body: JSON.stringify({"Mappings": newMappingDefs})
    }
    fetch(url, option)
      .then(res => res.json())
      .then(body => {
        setMappingDefs(body["Mappings"])
        setTmpMapping({...emptyMapping})
        setSelectedMapping(null)

        console.log(body["Mappings"])
      })
      .catch(e => console.error(e))

      setEditMappingDialogOpen(false)
  }

  const handleEditMappingDialogChange = (key, newValue) => {
    console.log(newValue)
    setTmpMapping({ ...tmpMapping, [key]: newValue })

  }

  React.useEffect(() => {
    console.log(tmpMapping)
  }, [tmpMapping])

  return (

    <div>
      <TableContainer component={Paper}>
        <Table aria-label="simple table" stickyHeader={true}>
          <TableHead>
            <TableRow sx={{ overflow: "auto" }}>
              {mappingFields.map((f) => {
                return (
                  <TableCell sx={{ maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis" }}>{f}</TableCell>
                )
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {mappingDefs.map((m, i) => (
              <TableRow
                key={`${m["Name"]}-${i}`}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                onClick={() => handleMappingSelected(m, i)}
                hover={true}
              >
                {mappingFields.map((f) => {
                  return (
                    <TableCell sx={{ maxWidth: 50, overflow: "hidden", textOverflow: "ellipsis" }} key={`${m[f]}-${f}`}>
                      {m[f]}
                    </TableCell>
                  )
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <div>
        {/* <Stack direction="raw" spacing={2}> */}
        <Grid
          container
          justifyContent={"center"}
        >
          <Button
            style={{ alignItems: 'center', }}
            variant={"contained"}
            startIcon={<AddIcon />}
            onClick={() => {
              return setEditMappingDialogOpen(true)
            }}
          >
            ADD
          </Button>
        </Grid>
        {/* </Stack> */}
      </div>

      <Dialog
        open={editMappingDialogOpen}
        onClose={() => handleEditMappingDialogClose(false, null)}
      >
        <DialogTitle>Edit Mapping</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Edit mapping.
          </DialogContentText>
          <Stack
            spacing={2}
            direction={"row"}
          >
            {mappingFields.map((f) => {
              return (
                <Autocomplete
                  id={`${f}`}
                  sx={{width: 750}}

                  inputValue={tmpMapping[f]}
                  value={tmpMapping[f]}
                  freeSolo
                  fullWidth
                  onInputChange={(e, newValue) => {handleEditMappingDialogChange(f, newValue === null ? "" : newValue)}}
                  onChange={(e, newInputValue) => handleEditMappingDialogChange(f, newInputValue === null ? "" : newInputValue)}
                  options={Array.from(new Set(mappingDefs.map((m) => m[f])))}
                  renderInput={(params) => <TextField
                    {...params}
                    label={f} 
                    margin="dense"
                    fullWidth
                    variant="standard"
                  />}
                />
              )
            })}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleEditMappingDialogClose(true, "delete")}>DELETE</Button>
          <Button onClick={() => handleEditMappingDialogClose(true, "save")}>SAVE</Button>
        </DialogActions>
      </Dialog>
    </div >

  )
}