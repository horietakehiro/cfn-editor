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

export const Parameters = ({
  templateName, projectName,
  parameterDefs, setParameterDefs,
  selectedTemplate, setSelectedTemplate,
  // selectedTab, setSelectedTab, 
}) => {

  const [parameterFields, setParameterFields] = React.useState({})
  const [parameterTypes, setParameterTypes] = React.useState([])
  const [selectedParameter, setSelectedParameter] = React.useState(null)
  const [tmpParameter, setTmpParameter] = React.useState(null)
  const [parameterUrl, setParameterUrl] = React.useState(null)

  React.useEffect(() => {
    var url = config.BASE_API_URL + `project/${projectName}/template/${templateName}/parameter/__FIELDS__`
    fetch(url)
      .then(res => res.json())
      .then(body => {
        setParameterFields({ ...body["Fields"] })
        console.log(parameterFields)
      })
      .catch(e => console.error(e))

    url = config.BASE_API_URL + `project/${projectName}/template/${templateName}/parameter/__TYPES__`
    fetch(url)
      .then(res => res.json())
      .then(body => {
        console.log(body)
        setParameterTypes(body["Types"])
      })
      .catch(e => console.error(e))

    url = config.BASE_API_URL + `project/${projectName}/template/${templateName}/parameter/__URL__`
    fetch(url)
      .then(res => res.json())
      .then(body => {
        console.log(body)
        const docUrl = new URL(body["Url"])
        const newUrl = config.BASE_STATIC_URL + docUrl.host + "/" + docUrl.pathname
        console.log(newUrl)
        setParameterUrl(newUrl)
      })
      .catch(e => console.error(e))

    // url = config.BASE_API_URL + `project/${projectName}/template/${templateName}/parameter`
    // fetch(url)
    //   .then(res => res.json())
    //   .then(body => {
    //     const newParameterDef = [...body["Parameters"]]
    //     setParameterDefs(newParameterDef)
    //   })
  }, [])


  const handleParameterSelected = (parameter) => {
    setSelectedParameter(parameter)
    setTmpParameter(parameter)
  }
  const handleParameterChange = (key, e) => {
    var newParameter = { ...tmpParameter }

    if (key === "AllowedValues") {
      newParameter[key] = e.target.value.split(",")
    } else if (key === "NoEcho") {
      newParameter[key] = e.target.value === "TRUE" ? true : false
    } else {
      newParameter[key] = e.target.value
    }
    setTmpParameter(newParameter)

  }
  const handleButtonClick = (kind, e) => {
    if (kind === "cancel") {
      setTmpParameter(null)
      setSelectedParameter(null)
      return
    }

    if (kind === "delete") {
      var newParameterDef = [...parameterDefs]
      newParameterDef = newParameterDef.filter(p => p["Name"] !== selectedParameter["Name"])
      setParameterDefs(newParameterDef)
      setTmpParameter(null)
      setSelectedParameter(null)
      console.log(newParameterDef)


    } else if (kind === "save") {
      var newParameterDef = [...parameterDefs]
      console.log(newParameterDef)
      if (selectedParameter["Name"] !== tmpParameter["Name"]) {
        newParameterDef = newParameterDef.filter(p => p["Name"] !== selectedParameter["Name"])
        newParameterDef.push({ ...tmpParameter })
      }
      console.log(newParameterDef)

      newParameterDef = newParameterDef.map(p => {
        if (p["Name"] === tmpParameter["Name"]) {
          return tmpParameter
        } else {
          return p
        }
      })
      console.log(newParameterDef)
      setParameterDefs(newParameterDef)
      setTmpParameter(null)
      setSelectedParameter(null)

    }

    // update template
    var url = config.BASE_API_URL + `project/${projectName}/template/${templateName}/parameter`
    var body = {}
    for (const p of newParameterDef) {
      body[p["Name"]] = {}
      for (const key in p) {
        if (key === "Name" || key === "Filename" || p[key] === null) {
          continue
        }
        body[p["Name"]][key] = p[key]
      }
    }
    const option = {
      method: "POST",
      body: JSON.stringify({ "Parameters": body })
    }
    fetch(url, option)
      .then(res => res.json())
      .then(body => {
        console.log(body)
      })
      .catch(e => console.error(e))
  }

  // const useTableStyles = makeStyles(() => ({
  //   tableScrollBar: {
  //     overflowY: 'auto',
  //   },
  // }))
  // const classes = useTableStyles()
  // const useStyles = makeStyles({
  //   table: {
  //     minWidth: 650
  //   }
  // });

  // const classes = useStyles();

  if (selectedParameter === null) {
    return (
      
      <div>
        <TableContainer component={Paper}>
          <Table  aria-label="simple table" stickyHeader={true}>
            <TableHead>
              <TableRow sx={{overflow: "auto"}}>
                <TableCell sx={{maxWidth:100, overflow: "hidden", textOverflow: "ellipsis"}}>Name</TableCell>
                {Object.entries(parameterFields).map(
                  ([k, v]) => <TableCell sx={{maxWidth:100, overflow: "hidden",  textOverflow: "ellipsis"}} key={k} align='right'>{k}</TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {parameterDefs.map((p) => (
                <TableRow
                  key={p["Name"]}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 }}}
                  onClick={() => handleParameterSelected(p)}
                  hover={true}
                >
                  <TableCell sx={{maxWidth:100, overflow: "hidden",  textOverflow: "ellipsis"}} key={`${p["Name"]}-Name`}>{p["Name"]}</TableCell>
                  {Object.entries(parameterFields).map(
                    ([k, v]) => <TableCell sx={{maxWidth:100, overflow: "hidden",  textOverflow: "ellipsis",}} align="right" key={`${p["Name"]}-${k}`}>{repr(p[k])}</TableCell>
                  )}
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
                var param = {}
                for (const f of Object.entries(parameterFields)) {
                  param[f[0]] = null
                }
                return handleParameterSelected(param)
              }}
            >
              ADD
            </Button>
          </Grid>
          {/* </Stack> */}
        </div>

      </div>

    )
  } else {
    return <div>
      <Grid container spacing={2} columns={16}>
        <Grid item xs={8}>
          <Item>
            <Iframe
              url={parameterUrl}
              // width="600"
              // height="1000"
              width="100%"
              height="500"
              id="myId"
              className="myClassname"
              display="initial"
              position="relative"
            />
          </Item>
        </Grid>
        <Grid item xs={8}>
        <div>
            <Stack direction="row" spacing={2}>
              <Button
                variant={"outlined"}
                startIcon={<ArrowBackIcon />}
                onClick={(e) => handleButtonClick("cancel", e)}
              >
                CANCEL
              </Button>
              <Button
                variant={"outlined"}
                startIcon={<DeleteIcon />}
                onClick={(e) => handleButtonClick("delete", e)}
              >
                DELETE
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={(e) => handleButtonClick("save", e)}
              >
                SAVE
              </Button>
            </Stack>

          </div>
          <Item>
            <Box
              sx={{ overflow: 'auto' }}
              component={"form"}
              width="100%"
              height={500}
            >
              <div>
                <TextField
                  // error={tmpProjectNameError}
                  autoFocus
                  margin="dense"
                  id="Name"
                  label="Name"
                  fullWidth={false}
                  variant="standard"
                  required={true}
                  defaultValue={selectedParameter["Name"] !== null ? selectedParameter["Name"] : null}
                  onChange={(e) => handleParameterChange("Name", e)}
                />
                <TextField
                  // error={tmpProjectNameError}
                  // autoFocus
                  margin="dense"
                  id="Description"
                  label="Description"
                  fullWidth={true}
                  variant="standard"
                  required={false}
                  defaultValue={selectedParameter["Description"] !== null ? selectedParameter["Description"] : null}
                  onChange={(e) => handleParameterChange("Description", e)}
                />
                <TextField
                  // error={tmpProjectNameError}
                  // autoFocus
                  margin="dense"
                  id="Type"
                  label="Type"
                  fullWidth={true}
                  variant="standard"
                  required={false}
                  select={true}
                  defaultValue={selectedParameter["Type"] !== null ? selectedParameter["Type"] : parameterTypes[0]}
                  onChange={(e) => handleParameterChange("Type", e)}
                >
                  {parameterTypes.map(p => {
                    return (
                      <MenuItem key={p} value={p}>
                        {p}
                      </MenuItem>
                    )
                  })}
                </TextField>
                <TextField
                  // error={tmpProjectNameError}
                  // autoFocus
                  margin="dense"
                  id="Default"
                  label="Default"
                  fullWidth={true}
                  variant="standard"
                  required={false}
                  defaultValue={selectedParameter["Default"] !== null ? selectedParameter["Default"] : null}
                  onChange={(e) => handleParameterChange("Default", e)}
                />
                <TextField
                  // error={tmpProjectNameError}
                  // autoFocus
                  margin="dense"
                  id="MinLength"
                  label="MinLength"
                  type={"number"}
                  fullWidth={true}
                  variant="standard"
                  required={false}
                  onChange={(e) => handleParameterChange("MinLength", e)}
                  defaultValue={selectedParameter["MinLength"] !== null ? selectedParameter["MinLength"] : null}
                />
                <TextField
                  // error={tmpProjectNameError}
                  // autoFocus
                  margin="dense"
                  id="MaxLength"
                  label="MaxLength"
                  type={"number"}
                  fullWidth={true}
                  variant="standard"
                  required={false}
                  defaultValue={selectedParameter["MaxLength"] !== null ? selectedParameter["MaxLength"] : null}
                  onChange={(e) => handleParameterChange("MaxLength", e)}
                />
                <TextField
                  // error={tmpProjectNameError}
                  // autoFocus
                  margin="dense"
                  id="MinValue"
                  label="MinValue"
                  type={"number"}
                  fullWidth={true}
                  variant="standard"
                  required={false}
                  defaultValue={selectedParameter["MinValue"] !== null ? selectedParameter["MinValue"] : null}
                  onChange={(e) => handleParameterChange("MinValue", e)}
                />
                <TextField
                  // error={tmpProjectNameError}
                  // autoFocus
                  margin="dense"
                  id="MaxValue"
                  label="MaxValue"
                  type={"number"}
                  fullWidth={true}
                  variant="standard"
                  required={false}
                  defaultValue={selectedParameter["MaxValue"] !== null ? selectedParameter["MaxValue"] : null}
                  onChange={(e) => handleParameterChange("MaxValue", e)}
                />
                <TextField
                  // error={tmpProjectNameError}
                  // autoFocus
                  margin="dense"
                  id="AllowedValues"
                  label="AllowedValues"
                  type={"text"}
                  fullWidth={true}
                  variant="standard"
                  required={false}
                  helperText={"separate with comma(,)"}
                  defaultValue={selectedParameter["AllowedValues"] !== null ? selectedParameter["AllowedValues"].join(",") : null}
                  onChange={(e) => handleParameterChange("AllowedValues", e)}
                />
                <TextField
                  // error={tmpProjectNameError}
                  // autoFocus
                  margin="dense"
                  id="AllowedPattern"
                  label="AllowedPattern"
                  type={"text"}
                  fullWidth={true}
                  variant="standard"
                  required={false}
                  defaultValue={selectedParameter["AllowedPattern"] !== null ? selectedParameter["AllowedPattern"] : null}
                  onChange={(e) => handleParameterChange("AllowedPattern", e)}
                />
                <TextField
                  // error={tmpProjectNameError}
                  // autoFocus
                  margin="dense"
                  id="ConstraintDescription"
                  label="ConstraintDescription"
                  type={"text"}
                  fullWidth={true}
                  variant="standard"
                  required={false}
                  defaultValue={selectedParameter["ConstraintDescription"] !== null ? selectedParameter["ConstraintDescription"] : null}
                  onChange={(e) => handleParameterChange("ConstraintDescription", e)}

                />
                <TextField
                  // error={tmpProjectNameError}
                  // autoFocus
                  margin="dense"
                  id="NoEcho"
                  label="NoEcho"
                  fullWidth={true}
                  variant="standard"
                  required={false}
                  type={"text"}
                  select={true}
                  defaultValue={selectedParameter["NoEcho"] !== null ? selectedParameter["NoEcho"].toString().toUpperCase() : "TRUE"}
                  onChange={(e) => handleParameterChange("NoEcho", e)}
                >
                  <MenuItem key={"TRUE"} value={"TRUE"}>TRUE</MenuItem>
                  <MenuItem key={"FALSE"} value={"FALSE"}>FALSE</MenuItem>
                </TextField>
              </div>
            </Box>
          </Item>

        </Grid>
      </Grid>
    </div>
  }
}