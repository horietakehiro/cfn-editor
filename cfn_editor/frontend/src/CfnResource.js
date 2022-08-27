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
import { DataGrid } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import FileOpenIcon from '@mui/icons-material/FileOpen';
import DeleteIcon from '@mui/icons-material/Delete';
import { MenuItem } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import CopyIcon from '@mui/icons-material/ContentCopy';
import RemoveIcon from '@mui/icons-material/Remove';

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

import LoadingButton from '@mui/lab/LoadingButton';
// import Autocomplete from '@mui/material/Autocomplete';


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

const reprValue = (v) => {
  if (Array.isArray(v)) {
    return v.join(",")
  } else if (typeof v === "boolean") {
    return v ? "TRUE" : "FALSE"
  }
  try {
    return JSON.stringify(v)
  } catch (e) {
    // // //// console.log(e)
    return v
  }
}

const hasChildProp = (curResource, index, allResources) => {
  if (allResources.length === index + 1) {
    return false
  }
  // // //// console.log(curResource)
  return allResources[index + 1]["Property"].startsWith(curResource["Property"])
}


const isChildProp = (curResource, index, allResources) => {
  if (index === 0) {
    return false
  }
  var propElements = curResource["Property"].split(".")
  if (propElements.length === 1) {
    return false
  }
  var parentElements = propElements.slice(0, propElements.length - 2).join(".")
  parentElements = parentElements.split("[")
  parentElements = parentElements.slice(0, parentElements.length - 2).join("[")

  return curResource["Property"].startsWith(parentElements)
}


export const Resources = ({
  templateName, projectName,
  selectedTemplate, setSelectedTemplate,
  // selectedTab, setSelectedTab, 
}) => {

  const [resourceDefs, setResourceDefs] = React.useState([])
  const [resourceFields, setResourceFields] = React.useState({})
  const [resourceTypes, setResourceTypes] = React.useState([])
  const [selectedResourceSummary, setSelectedResourceSummary] = React.useState(null)
  const [tmpResourceSummary, setTmpResourceSummary] = React.useState(null)
  const [selectedResourceDetail, setSelectedResourceDetail] = React.useState(null)
  const [selectedProperties, setSelectedProperties] = React.useState([""])
  const [selectedResourceSpec, setSelectedResourceSpec] = React.useState({})
  const [selectedPropertySpecs, setSelectedPropertySpecs] = React.useState([])
  const [tmpResourceDetail, setTmpResourceDetail] = React.useState(null)
  const [selectedResourceUrls, setSelectedResourceUrls] = React.useState([])
  const [newResourceSummary, setNewResourceSummary] = React.useState({"ResourceType": null, "ResourceId": null})
  const [newResourceLoading, setNewResourceLoading] = React.useState(false)

  const [cloneResourceDialogOpen, setCloneResourceDialogOpen] = React.useState(false)
  const [cloneResourceId, setCloneResourceId] = React.useState("")

  const [selectedListProps, setSelectedListProps] = React.useState([{ "isList": false, "resource": null }])
  const [selectedListIndex, setSelectedListIndex] = React.useState(0)
  const [propEditDialogOpen, setPropEditDialogOpen] = React.useState(false)
  const [propEditValue, setPropEditValue] = React.useState({})

  React.useEffect(() => {
    var url = config.BASE_API_URL + `project/${projectName}/template/${templateName}/resource/__TYPES__`
    fetch(url)
      .then(res => res.json())
      .then(body => {
        console.log(body)
        setResourceTypes(body["Types"])
      })
      .catch(e => console.error(e))


    url = config.BASE_API_URL + `project/${projectName}/template/${templateName}/resource`
    fetch(url)
      .then(res => res.json())
      .then(body => {
        const newResourceDef = [...body["Resources"]]
        setResourceDefs(newResourceDef)
      })
  }, [])


  const handleResourceSelected = (resource) => {
    setSelectedResourceSummary({ ...resource })
    setTmpResourceSummary({ ...resource })
    var url = config.BASE_API_URL + `project/${projectName}/template/${templateName}/resource/${resource["ResourceId"]}`
    fetch(url)
      .then(res => res.json())
      .then(body => {
        // // //// console.log(body)
        setSelectedResourceDetail(body["Resource"])
        setTmpResourceDetail(body["Resource"])
      })
      .catch(e => console.error(e))

    url = config.BASE_API_URL + `project/${projectName}/template/${templateName}/resource/${resource["ResourceType"]}`
    fetch(url)
      .then(res => res.json())
      .then(body => {
        setSelectedResourceSpec({ ...body["Resource"] })
        // // //// console.log(body["Resource"])
        const docUrl = new URL(body["Resource"]["Documentation"])
        const newUrl = config.BASE_STATIC_URL + docUrl.host + "/" + docUrl.pathname
        setSelectedResourceUrls([...selectedResourceUrls, newUrl])
      })
  }

  const handleResourceSummaryChange = (key, e) => {
    var newResourceSummary = { ...tmpResourceSummary }
    newResourceSummary[key] = e.target.value
    // setTmpResourceDetail(newResourceSummary)
    setTmpResourceSummary(newResourceSummary)
    // // //// console.log(newResourceSummary)

  }
  const handleButtonClick = (kind, r) => {

    if (kind === "cancel") {
      if (selectedProperties.length !== 1) {
        setSelectedListProps([...selectedListProps.slice(0, selectedListProps.length - 1)])
        setSelectedProperties([...selectedProperties.slice(0, selectedProperties.length - 1)])
        setSelectedResourceUrls([...selectedResourceUrls.slice(0, selectedResourceUrls.length - 1)])
        setSelectedPropertySpecs([...selectedPropertySpecs.slice(0, selectedPropertySpecs.length - 1)])
      } else {
        setTmpResourceDetail(null)
        setSelectedResourceDetail(null)

      }
      return
    }

    if (kind === "delete") {
      var url = config.BASE_API_URL + `project/${projectName}/template/${templateName}/resource/${selectedResourceSummary["ResourceId"]}`
      const option = {
        method: "DELETE",
      }
      fetch(url, option)
        .then(res => res.json())
        .then(body => {
          console.log(body)
          setSelectedListProps([{ "isList": false, "resource": null }])
          setSelectedProperties([""])
          setSelectedResourceUrls([...selectedResourceUrls.slice(0, selectedResourceUrls.length - 1)])
          setSelectedPropertySpecs([...selectedPropertySpecs.slice(0, selectedPropertySpecs.length - 1)])
          setTmpResourceDetail(null)
          setSelectedResourceDetail(null)
          setResourceDefs([...body["Resources"]])
        })
        .catch(e => console.error(e))


    } else if (kind === "save") {

      if (r !== null) {
        var tmpResourceSummary = r
      }
      var newResourceDetails = []
      console.log(tmpResourceSummary)
      for (var r of tmpResourceDetail) {
        var newR = { ...r }
        newR["ResourceId"] = tmpResourceSummary["ResourceId"]
        newR["ResourceNote"] = tmpResourceSummary["ResourceNote"]
        newResourceDetails.push({
          ...r, "ResourceNote": tmpResourceSummary["ResourceNote"], "ResourceId": tmpResourceSummary["ResourceId"]
        })
      }

      // update template
      var url = config.BASE_API_URL + `project/${projectName}/template/${templateName}/resource`
      const option = {
        method: "POST",
        body: JSON.stringify({
          "Resources": newResourceDetails,
          "PrevResourceId": tmpResourceSummary["ResourceId"],
        })
      }
      fetch(url, option)
        .then(res => res.json())
        .then(body => {
          console.log(body)
          setSelectedListProps([{ "isList": false, "resource": null }])
          setSelectedProperties([""])
          setSelectedResourceUrls([...selectedResourceUrls.slice(0, selectedResourceUrls.length - 1)])
          setSelectedPropertySpecs([...selectedPropertySpecs.slice(0, selectedPropertySpecs.length - 1)])
          setTmpResourceDetail(null)
          setSelectedResourceDetail(null)
          setResourceDefs([...body["Resources"]])

        })
        .catch(e => console.error(e))

      // setSelectedListProps([...selectedListProps.slice(0, selectedListProps.length - 1)])
      // setSelectedProperties([...selectedProperties.slice(0, selectedProperties.length - 1)])
      // setSelectedResourceUrls([...selectedResourceUrls.slice(0, selectedResourceUrls.length - 1)])
      // setSelectedPropertySpecs([...selectedPropertySpecs.slice(0, selectedPropertySpecs.length - 1)])
      // setTmpResourceDetail(null)
      // setSelectedResourceDetail(null)


    }
  }

  const handlePropEditDialogClose = (resource) => {
    // console.log(resource)
    // console.log(propEditValue)
    resource["Value"] = propEditValue[resource["Property"]]
    var newResource = tmpResourceDetail.filter((r) => {
      return r["Property"] !== resource["Property"]
    })
    newResource.push(resource)
    newResource.sort((a, b) => {
      if (a["Property"] > b["Property"]) {
        return 1
      } else {
        return -1
      }
    })

    setTmpResourceDetail([...newResource])
    setSelectedListProps([...selectedListProps.slice(0, selectedListProps.length - 1)])
    setSelectedProperties([...selectedProperties.slice(0, selectedProperties.length - 1)])
    // setSelectedResourceUrls([...selectedResourceUrls.slice(0, selectedResourceUrls.length - 1)])
    setSelectedPropertySpecs([...selectedPropertySpecs.slice(0, selectedPropertySpecs.length - 1)])


    setPropEditDialogOpen(false)

  }

  const onPropertyButtonClick = (resource, event) => {

    // console.log(tmpResourceDetail)

    const isRoot = selectedProperties[selectedProperties.length - 1] === ""
    var baseProperty = resource["Property"].split(".")
    baseProperty = baseProperty[baseProperty.length - 1]
    var property

    var curPropertySpec = selectedPropertySpecs[selectedPropertySpecs.length - 1]

    if (isRoot) {
      property = selectedResourceSpec["Properties"][baseProperty]
    } else {
      property = curPropertySpec[Object.keys(curPropertySpec)[0]]["Properties"][baseProperty]
    }
    setSelectedListProps([...selectedListProps, { "isList": "Type" in property & property["Type"] === "List", "resource": { ...resource } }])
    // // //// console.log(selectedResourceSpec)
    const isPrimitive = "PrimitiveType" in property || "PrimitiveItemType" in property


    setSelectedProperties((prev => [...prev, resource["Property"]]))

    // open edit dialog
    if (isPrimitive) {
      setPropEditDialogOpen(true)

    } else {
      // setSelectedProperties((prev => [...prev, resource["Property"]]))

      // get child props spec
      var propertyType = resource["Property"].split(".")[resource["Property"].split(".").length - 1]
      if (propertyType === "Tags") {
        propertyType = "Tag"
      } else {
        var tmp
        if (isRoot) {
          tmp = selectedResourceSpec["Properties"][propertyType]
        } else {
          tmp = curPropertySpec[Object.keys(curPropertySpec)[0]]["Properties"][propertyType]
        }
        //// console.log(propertyType)
        propertyType = "ItemType" in tmp ? `${resource["ResourceType"]}.${tmp["ItemType"]}` : `${resource["ResourceType"]}.${tmp["Type"]}`
      }
      // propertyType = propertyType === "Tags" ? "Tag" : `${resource["ResourceType"]}.${propertyType}`
      // //// console.log(propertyType)

      const url = config.BASE_API_URL + `project/${projectName}/template/${templateName}/resource/${propertyType}`
      fetch(url)
        .then(res => res.json())
        .then(body => {
          // //// console.log(body)
          const docUrl = new URL(body["Property"][propertyType]["Documentation"])
          const newUrl = config.BASE_STATIC_URL + docUrl.host + "/" + docUrl.pathname
          setSelectedResourceUrls([...selectedResourceUrls, newUrl])
          setSelectedPropertySpecs([...selectedPropertySpecs, { ...body["Property"] }])
        })
    }

  }

  const shouldDisplay = (resource, index) => {
    const isSelectedProperty = resource["Property"].startsWith(selectedProperties[selectedProperties.length - 1])
    const isChild = isChildProp(resource, index, tmpResourceDetail)
    const isRoot = selectedProperties[selectedProperties.length - 1] === ""

    if (resource["Property"].startsWith("BlockDeviceMappings[0].Ebs")) {
      // //// console.log(resource, selectedProperties[selectedProperties.length-1].split(".").length, resource["Property"].split(".").length)
    }

    if (isRoot) {
      if (isChild) {
        return false
      } else {
        return true
      }
    } else {
      if (resource["Property"].split(".").length - selectedProperties[selectedProperties.length - 1].split(".").length !== 1) {
        return false
      }
    }

    if (isSelectedProperty) {
      return selectedProperties[selectedProperties.length - 1] !== resource["Property"]
    }
    return false
  }

  const handleListAppend = () => {

    const listProp = selectedListProps[selectedListProps.length - 1]["resource"]["Property"]
    //// console.log(listProp)
    // filter resources to append
    var targetResourceSet = tmpResourceDetail.filter((r) => {
      return r["Property"].startsWith(`${listProp}[`)
    })
    // count number of rows per index
    var num_per_index = {}
    for (var r of targetResourceSet) {
      const rx = new RegExp(`^${listProp}\\[(\\d+)\\]`)
      const index = r["Property"].match(rx)[1]
      if (index in num_per_index) {
        num_per_index[index] = num_per_index[index] + 1
      } else {
        num_per_index[index] = 1
      }
    }
    // use min value
    var minValue = Math.min(...Object.keys(num_per_index).map((k) => num_per_index[k]))
    // var maxValue = Math.max(...Object.keys(num_per_index).map((k) => num_per_index[k]))
    var minIndex = Object.keys(num_per_index).find((k) => num_per_index[k] == minValue)

    var curLastIndex = Math.max(...Object.keys(num_per_index).map((k) => parseInt(k)))

    //// console.log(targetResourceSet)
    var targetResource = targetResourceSet.filter((r) => {
      return r["Property"].startsWith(`${listProp}[${minIndex}]`)
    })
    // const numSet = parseInt(targetResourceSet.length / targetResource.length)

    var newResource = []
    for (var r of targetResource) {
      newResource.push({ ...r, "value": null, "Property": r["Property"].replace(`${listProp}[${minIndex}]`, `${listProp}[${curLastIndex + 1}]`) })
    }
    //// console.log(newResource)

    var newResources = tmpResourceDetail.concat(newResource)
    newResources.sort((a, b) => {
      if (a["Property"] > b["Property"]) {
        return 1
      } else {
        return -1
      }
    })
    setTmpResourceDetail([...newResources])

  }


  const handleListRemove = (index) => {
    if (index < 0) {
      return
    }
    const listProp = selectedListProps[selectedListProps.length - 1]["resource"]["Property"]
    //// console.log(listProp)
    // filter resources to keep
    var targetResource = tmpResourceDetail.filter((r) => {
      return !r["Property"].startsWith(`${listProp}[${index}]`)
    })

    var isLastOne = true
    if (index === 0) {
      for (var r of targetResource) {
        if (r["Property"].startsWith(`${listProp}[`)) {
          isLastOne = false
          break
        }
      }
    }

    var newResource = []
    for (var r of targetResource) {
      var newR
      if (isLastOne) {
        newR = { ...r }
      } else if (r["Property"].startsWith(`${listProp}[`) & r["Property"] > `${listProp}[${index}]`) {
        const rx = new RegExp(`^${listProp}\\[(\\d+)\\]`)
        const curIndex = r["Property"].match(rx)[1]
        const newIndex = curIndex - 1
        newR = { ...r, "Property": r["Property"].replace(`${listProp}[${curIndex}]`, `${listProp}[${newIndex}]`) }
      } else {
        newR = { ...r }
      }
      newResource.push({ ...newR })
    }
    //// console.log(newResource)

    newResource.sort((a, b) => {
      if (a["Property"] > b["Property"]) {
        return 1
      } else {
        return -1
      }
    })
    setTmpResourceDetail([...newResource])

  }

  const handleNewResourceAdd = (type, e) => {
    if (type !== "submit") {
      console.log(e.target.value)
      setNewResourceSummary({...newResourceSummary, [type]: e.target.value})
      return
    }

    if (newResourceSummary["ResourceId"] === null | newResourceSummary["ResourceType"] === null) {
      return
    }

    setNewResourceLoading(true)
    // update template
    var url = config.BASE_API_URL + `project/${projectName}/template/${templateName}/resource`
    const option = {
      method: "POST",
      body: JSON.stringify({
        "ResourceType": newResourceSummary["ResourceType"],
        "ResourceId": newResourceSummary["ResourceId"],
      })
    }
    fetch(url, option)
      .then(res => res.json())
      .then(body => {
        console.log(body)
        var newResource = {...newResourceSummary, "ResourceNote": null}
        setResourceDefs([...resourceDefs, newResource])

        handleResourceSelected(newResource)

        setNewResourceSummary({"ResourceType": null, "ResourceId": null})
      })
      .catch(e => console.error(e))
      .finally(() => setNewResourceLoading(false))
  }

  const handleCloneResourceDialogOpen = () => {
    setCloneResourceId(`${selectedResourceSummary["ResourceId"]}Copy`)
    setCloneResourceDialogOpen(true)
  }
  const handleCloneResourceDialogClose = (submit) => {
    if (submit) {
      const newResourceSummary = {...tmpResourceSummary, "ResourceId": cloneResourceId}
      console.log(newResourceSummary)
      setTmpResourceSummary(newResourceSummary)
      handleButtonClick("save", newResourceSummary)
    }

    setCloneResourceDialogOpen(false)
  }

  if (selectedResourceDetail === null) {
    return (
      <Stack
        spacing={2}
        direction={"column"}
      >
        <TableContainer component={Paper}>
          <Table aria-label="simple table" stickyHeader={true}>
            <TableHead>
              <TableRow sx={{ overflow: "auto" }}>
                <TableCell
                  sx={{ maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis" }}
                >
                  Type
                </TableCell>
                <TableCell
                  sx={{ maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis" }}
                >
                  Id
                </TableCell>
                <TableCell
                  sx={{ maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis" }}
                >
                  Note
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {resourceDefs.map((r) => (
                <TableRow
                  key={r["ResourceId"]}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  onClick={() => handleResourceSelected(r)}
                  hover={true}
                >
                  <TableCell
                    sx={{ maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis" }}
                    key={`${r["ResourceId"]}-Type`}
                  >
                    {r["ResourceType"]}
                  </TableCell>
                  <TableCell
                    sx={{ maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis" }}
                    key={`${r["ResourceId"]}-Id`}
                  >
                    {r["ResourceId"]}
                  </TableCell>
                  <TableCell
                    sx={{ maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis" }}
                    key={`${r["ResourceId"]}-Note`}
                  >
                    {r["ResourceNote"]}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Stack direction="raw" spacing={2}>
          <Grid
            // direction={"row"}
            spacing={2}
            container
            justifyContent={"center"}
            alignItems={"flex-end"}
          >
            <Grid item>
              {/* <TextField
                autoFocus
                margin="dense"
                id="Type"
                label="Type"
                fullWidth={false}
                variant="standard"
                required={true}
                onChange={(e) => handleNewResourceAdd("ResourceType", e)}
                select={true}
              >
                {resourceTypes?.map(r => {
                  return (
                    <MenuItem key={r} value={r}>
                      {r}
                    </MenuItem>
                  )
                })}
              </TextField> */}
              <Autocomplete
                disablePortal={false}
                id="Type"
                options={resourceTypes}
                sx={{ width: 300 }}
                onChange={(e, value) => handleNewResourceAdd("ResourceType", {target: {value: value}})}
                
                // fullWidth={true}
                renderInput={(params) => <TextField
                    {...params}
                    label="Type"
                    variant='standard'
                    fullWidth={true}
                />}
              />
            </Grid>
            <Grid item>
              <TextField
                autoFocus
                margin="dense"
                id="Id"
                label="Id"
                fullWidth={false}
                variant="standard"
                required={true}
                onChange={(e) => handleNewResourceAdd("ResourceId", e)}
              />
            </Grid>
            <Grid item>
              {/* <Button
                style={{ alignItems: 'center', }}
                variant={"contained"}
                startIcon={<AddIcon />}
                onClick={(e) => handleNewResourceAdd("submit", e)}
              >
                ADD
              </Button> */}
              <LoadingButton
                // size="small"
                style={{ alignItems: 'center', }}
                // color="secondary"
                onClick={(e) => handleNewResourceAdd("submit", e)}
                // onClick={handleClick}
                loading={newResourceLoading}
                loadingPosition="start"
                // startIcon={<SaveIcon />}
                variant="contained"
              >
                ADD
              </LoadingButton>
            </Grid>

          </Grid>
        </Stack>
      </Stack>

    )
  } else {
    return <div>
      <Grid container spacing={2} columns={16}>
        <Grid item xs={8}>
          <Item>
            <Iframe
              url={selectedResourceUrls[selectedResourceUrls.length - 1]}
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
                onClick={() => handleButtonClick("cancel", null)}
              >
                CANCEL
              </Button>
              <Button
                variant={"outlined"}
                startIcon={<DeleteIcon />}
                onClick={() => handleButtonClick("delete", null)}
              >
                DELETE
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={() => handleButtonClick("save", null)}
              >
                SAVE
              </Button>
              <Button
                variant="contained"
                startIcon={<CopyIcon />}
                onClick={() => handleCloneResourceDialogOpen()}
              >
                CLONE
              </Button>

            </Stack>

            <Dialog
              open={cloneResourceDialogOpen}
              onClose={() => handleCloneResourceDialogClose(false)}
            >
              <DialogTitle>Clone Resource</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  Clone resource.
                </DialogContentText>
                <div style={{ height: 400, width: '100%' }}>
                  <TextField
                    autoFocus
                    margin="dense"
                    id="NewId"
                    label="New Resource Id"
                    fullWidth
                    variant="standard"
                    defaultValue={`${selectedResourceSummary["ResourceId"]}Copy`}
                    onChange={(e) => setCloneResourceId(e.target.value)}
                  />
                </div>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => handleCloneResourceDialogClose(true)}>OK</Button>
              </DialogActions>
            </Dialog>
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
                  autoFocus
                  margin="dense"
                  id="Id"
                  label="Id"
                  fullWidth={false}
                  variant="standard"
                  required={true}
                  disabled={selectedResourceSummary["ResourceId"] !== null ? selectedResourceSummary["ResourceId"] : null}
                  defaultValue={selectedResourceSummary["ResourceId"] !== null ? selectedResourceSummary["ResourceId"] : null}
                  onChange={(e) => handleResourceSummaryChange("ResourceId", e)}
                />
                <TextField
                  autoFocus
                  margin="dense"
                  id="Type"
                  label="Type"
                  fullWidth={true}
                  variant="standard"
                  required={true}
                  disabled={selectedResourceSummary["ResourceType"] !== null ? selectedResourceSummary["ResourceType"] : null}
                  defaultValue={selectedResourceSummary["ResourceType"] !== null ? selectedResourceSummary["ResourceType"] : null}
                  onChange={(e) => handleResourceSummaryChange("ResourceType", e)}
                />

                <TextField
                  autoFocus
                  margin="dense"
                  id="Note"
                  label="Note"
                  fullWidth={true}
                  variant="standard"
                  required={false}
                  defaultValue={selectedResourceSummary["ResourceNote"] !== null ? selectedResourceSummary["ResourceNote"] : null}
                  onChange={(e) => handleResourceSummaryChange("ResourceNote", e)}
                />
              </div>
              <div>
                Properties
                <div>

                  <Stack direction={"row"} spacing={2}>
                    <Button
                      sx={{ display: (selectedListProps[selectedListProps.length - 1]["isList"]) ? null : "none" }}
                      style={{ justifyContent: "flex-start", textTransform: "none" }}
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => handleListAppend()}
                    >
                      APPEND
                    </Button>
                    <Button
                      sx={{ display: (selectedListProps[selectedListProps.length - 1]["isList"]) ? null : "none" }}
                      style={{ justifyContent: "flex-start", textTransform: "none" }}
                      variant="contained"
                      startIcon={<RemoveIcon />}
                      onClick={() => handleListRemove(selectedListIndex)}
                    >
                      REMOVE
                    </Button>
                    <TextField
                      sx={{ display: (selectedListProps[selectedListProps.length - 1]["isList"]) ? null : "none" }}
                      margin="dense"
                      id="RemoveIndex"
                      label="Index to be removed"
                      fullWidth={false}
                      variant="standard"
                      required={true}
                      type={"number"}
                      defaultValue={selectedListIndex}
                      onChange={(e) => { setSelectedListIndex(e.target.value) }}
                    />
                  </Stack>
                </div>

                <Stack direction="column" spacing={2}>
                  {tmpResourceDetail?.map((r, index) => {
                    return (
                      <React.Fragment>
                        <Button
                          sx={{ display: shouldDisplay(r, index) ? null : "none" }}
                          style={{ justifyContent: "flex-start", textTransform: "none" }}
                          variant={
                            (hasChildProp(r, index, tmpResourceDetail) & !r["IsOmittable"]) || (r["Value"] !== null & r["Value"] !== undefined) ? "contained" : "outlined"}
                          startIcon={<EditIcon />}
                          onClick={(e) => onPropertyButtonClick(r, e)}
                        >
                          {r["Required"] === "Yes" ? `${r["Property"]}(Required)` : `${r["Property"]}`}
                        </Button>
                        <Dialog
                          open={Boolean(r["Property"] === selectedProperties[selectedProperties.length - 1] & propEditDialogOpen)}
                          onClose={() => handlePropEditDialogClose(r)}
                        >
                          <DialogTitle>Edit {r["Property"]}'s Value</DialogTitle>
                          <DialogContent>
                            <DialogContentText>
                              Edit Property Value.
                            </DialogContentText>
                            <div style={{ height: 400, width: '100%' }}>
                              <TextField
                                autoFocus
                                margin="dense"
                                id="Value"
                                label="Value"
                                fullWidth
                                variant="standard"
                                defaultValue={r["Property"] in propEditValue ? propEditValue[r["Property"]] : null}
                                onChange={(e) => {
                                  // const p = r["Property"]
                                  setPropEditValue({ ...propEditValue, [r["Property"]]: e.target.value })
                                }}
                              />
                            </div>
                          </DialogContent>
                          <DialogActions>
                            <Button onClick={() => handlePropEditDialogClose(r)}>OK</Button>
                          </DialogActions>
                        </Dialog>

                      </React.Fragment>
                    )
                  })}
                </Stack>
              </div>
            </Box>
          </Item>
        </Grid>
      </Grid>
    </div>
  }
}