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

import Select from '@mui/material/Select';


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

export const Outputs = ({
  templateName, projectName,
  parameterDefs, setParameterDefs,
  templateDefs, setTemplateDefs,
  outputDefs, setOutputDefs,
  resourceDefs, setResourceDesf,
  selectedTemplate, setSelectedTemplate,
  attributeDefs, setAttributeDefs,
  // selectedTab, setSelectedTab, 
}) => {

  const [outputFields, setOutputFields] = React.useState({})
  // const [parameterTypes, setParameterTypes] = React.useState([])
  const [selectedOutput, setSelectedOutput] = React.useState(null)
  const [tmpOutput, setTmpOutput] = React.useState(null)
  const [outputUrl, setOutputUrl] = React.useState(null)

  const [inputType, setInputType] = React.useState("PlainText")


  React.useEffect(() => {
    var url = config.BASE_API_URL + `project/${projectName}/template/${templateName}/output/__FIELDS__`
    fetch(url)
      .then(res => res.json())
      .then(body => {
        setOutputFields({ ...body["Fields"] })
        console.log(outputFields)
      })
      .catch(e => console.error(e))

    url = config.BASE_API_URL + `project/${projectName}/template/${templateName}/output/__URL__`
    fetch(url)
      .then(res => res.json())
      .then(body => {
        console.log(body)
        const docUrl = new URL(body["Url"])
        const newUrl = config.BASE_STATIC_URL + docUrl.host + "/" + docUrl.pathname
        console.log(newUrl)
        setOutputUrl(newUrl)
      })
      .catch(e => console.error(e))

    // url = config.BASE_API_URL + `project/${projectName}/template/${templateName}/output`
    // fetch(url)
    //   .then(res => res.json())
    //   .then(body => {
    //     const newOutputDefs = [...body["Outputs"]]
    //     setOutputDefs(newOutputDefs)
    //   })
  }, [])

  React.useEffect(() => {
    var resourceTypes = new Set(resourceDefs.map((r) => r["ResourceType"]))
    resourceTypes = Array.from(resourceTypes)
    // console.log(resourceTypes)
    var promises = resourceTypes.map((type) => fetch(
      config.BASE_API_URL + `project/${projectName}/template/${templateName}/resource/${type}/__ATTRIBUTE__`
    ))
    Promise.all(promises)
    .then(responses => Promise.all(responses.map(r => r.json())))
    .then(attributes => {
      console.log(attributes)
      var newAttributeDefs = {}
      for (var a of attributes) {
        var key = Object.keys(a["Attributes"])[0]
        newAttributeDefs[key] = a["Attributes"][key]
      }
      console.log(newAttributeDefs)
      setAttributeDefs({attributeDefs, ...newAttributeDefs})
    })
    .catch(e => console.error)


  }, [resourceDefs])

  const handleOutputSelected = (output) => {
    setSelectedOutput(output)
    setTmpOutput(output)
  }
  const handleOutputChange = (key, e) => {
    var newOutput = { ...tmpOutput }

    newOutput[key] = e.target.value
    setTmpOutput(newOutput)

  }
  const handleButtonClick = (kind, e) => {
    if (kind === "cancel") {
      setTmpOutput(null)
      setSelectedOutput(null)
      return
    }

    if (kind === "delete") {
      var newOutputDefs = [...outputDefs]
      newOutputDefs = newOutputDefs.filter(p => p["Name"] !== selectedOutput["Name"])
      setOutputDefs(newOutputDefs)
      setTmpOutput(null)
      setSelectedOutput(null)
      console.log(newOutputDefs)


    } else if (kind === "save") {
      var newOutputDefs = [...outputDefs]
      console.log(newOutputDefs)
      if (selectedOutput["Name"] !== tmpOutput["Name"]) {
        newOutputDefs = newOutputDefs.filter(p => p["Name"] !== selectedOutput["Name"])
        newOutputDefs.push({ ...tmpOutput })
      }
      console.log(newOutputDefs)

      newOutputDefs = newOutputDefs.map(p => {
        if (p["Name"] === tmpOutput["Name"]) {
          return tmpOutput
        } else {
          return p
        }
      })
      console.log(newOutputDefs)
      setOutputDefs(newOutputDefs)
      setTmpOutput(null)
      setSelectedOutput(null)

    }

    // update template
    var url = config.BASE_API_URL + `project/${projectName}/template/${templateName}/output`
    var body = {}
    for (const o of newOutputDefs) {
      body[o["Name"]] = {}
      for (const key in o) {
        if (o === "Name" || key === "Filename" || o[key] === null) {
          continue
        } else if (key === "ExportName") {
          body[o["Name"]]["Export"] = { "Name": o[key] }
        }
        body[o["Name"]][key] = o[key]
      }
    }
    const option = {
      method: "POST",
      body: JSON.stringify({ "Outputs": body })
    }
    fetch(url, option)
      .then(res => res.json())
      .then(body => {
        console.log(body)
      })
      .catch(e => console.error(e))
  }

  const handleInputTypeChange = (e) => {
    console.log(e)
    setInputType(e.target.value)
  }

  if (selectedOutput === null) {
    return (

      <div>
        <TableContainer component={Paper}>
          <Table aria-label="simple table" stickyHeader={true}>
            <TableHead>
              <TableRow sx={{ overflow: "auto" }}>
                <TableCell sx={{ maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis" }}>Name</TableCell>
                {Object.entries(outputFields).map(
                  ([k, v]) => <TableCell sx={{ maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis" }} key={k} align='right'>{k}</TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {outputDefs.map((o) => (
                <TableRow
                  key={o["Name"]}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  onClick={() => handleOutputSelected(o)}
                  hover={true}
                >
                  <TableCell sx={{ maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis" }} key={`${o["Name"]}-Name`}>{o["Name"]}</TableCell>
                  {Object.entries(outputFields).map(
                    ([k, v]) => <TableCell sx={{ maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", }} align="right" key={`${o["Name"]}-${k}`}>{repr(o[k])}</TableCell>
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
                var o = {}
                for (const f of Object.entries(outputFields)) {
                  o[f[0]] = null
                }
                return handleOutputSelected(o)
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
              url={outputUrl}
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
                  defaultValue={selectedOutput["Name"] !== null ? selectedOutput["Name"] : null}
                  onChange={(e) => handleOutputChange("Name", e)}
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
                  defaultValue={selectedOutput["Description"] !== null ? selectedOutput["Description"] : null}
                  onChange={(e) => handleOutputChange("Description", e)}
                />
                <Grid
                  spacing={2}
                  container
                  justifyContent={"left"}
                  alignItems={"flex-end"}
                  direction={"raw"}
                >
                  <Grid item>
                    <FormHelperText>Input types</FormHelperText>
                    <Select
                      labelId="InputType"
                      id="InputType"
                      value={inputType}
                      // label="InputType"
                      label={"InputType"}
                      onChange={(e) => handleInputTypeChange(e)}
                    >
                      <MenuItem value={"PlainText"}>PlainText</MenuItem>
                      <MenuItem value={"Ref"}>Ref</MenuItem>
                      <MenuItem value={"GetAttr"}>GetAttr</MenuItem>
                    </Select>
                  </Grid>
                  <Grid item>
                    <TextField
                      autoFocus
                      margin="dense"
                      id="Value"
                      label="Value"
                      fullWidth
                      type={"text"}
                      variant="standard"
                      select={inputType !== "PlainText"}
                      defaultValue={selectedOutput["Value"] !== null ? selectedOutput["Value"] : null}
                      onChange={(e) => handleOutputChange("Value", e)}
                    >
                      {
                        inputType === "Ref"
                          ?
                          parameterDefs.map((p) => {
                            return (
                              <MenuItem key={p["Name"]} value={JSON.stringify({ "Ref": p["Name"] })}>{`${p["Name"]}(Parameter)`}</MenuItem>
                            )
                          }).concat(
                            resourceDefs.map((r) => {
                              return (
                                <MenuItem key={r["ResourceId"]} value={JSON.stringify({ "Ref": r["ResourceId"] })}>{`${r["ResourceId"]}(${r["ResourceType"]})`}</MenuItem>
                              )
                            })
                          )
                          : inputType === "GetAttr"
                          ?
                          resourceDefs.map((r) => {
                            return attributeDefs[r["ResourceType"]]?.map((a) => {
                              return (
                                // { "Fn::GetAtt" : [ "logicalNameOfResource", "attributeName" ] }
                                <MenuItem
                                  key={r["ResourceId"]}
                                  value={JSON.stringify({ "Fn::GetAtt": [r["ResourceId"], a] })}>{`${r["ResourceId"]}.${a}(${r["ResourceType"]})`}
                                </MenuItem>
                              )
                            })
                          })
                          : <div></div>                      }
                    </TextField>
                  </Grid>
                </Grid>
                <TextField
                  // error={tmpProjectNameError}
                  // autoFocus
                  margin="dense"
                  id="ExportName"
                  label="ExportName"
                  fullWidth={true}
                  variant="standard"
                  required={false}
                  defaultValue={selectedOutput["ExportName"] !== null ? selectedOutput["ExportName"] : null}
                  onChange={(e) => handleOutputChange("ExportName", e)}
                />
              </div>
            </Box>
          </Item>

        </Grid>
      </Grid>
    </div>
  }
}