import React, {useState} from 'react';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import useStyles from './styles/grid';
import AddDialog from './add';

function ProductGrid(){

  const classes = useStyles();
  
  const [openAddDialog, setOpenAddDialog] = useState(false);


  return <>
  <h1>Halaman Produk</h1>
    <Fab color="primary" className={classes.fab} onClick={(e)=>{setOpenAddDialog(true)}}>
      <AddIcon/>
    </Fab>
    <AddDialog
      open={openAddDialog}
      handleClose={()=>{
        setOpenAddDialog(false);
      }}
    />
  </>
}

export default ProductGrid;