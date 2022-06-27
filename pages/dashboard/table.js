import { Grid } from "@mui/material";
import { useSession } from "next-auth/react";
import ProductPerfomance from "../../src/components/dashboard/ProductPerfomance";

const Tables = () => {
const {status} = useSession({
    required: true
  })


  return (
    <Grid container spacing={0}>
      <Grid item xs={12} lg={12}>
        <ProductPerfomance />
      </Grid>
    </Grid>
  );
};

Tables.auth = true

export default Tables;
