import React, { useState } from "react";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import styles from "../styles/Table.module.css";
import { useGlobalState } from "../GlobalState.tsx";
import ImageWithFallback from "./ImageWithFallback.tsx";

interface StockRow {
  logo: string;
  name: string;
  ticker: string;
  environmental: string; // e.g., "3.5/10"
  social: string; // e.g., "4.2/10"
  governance: string; // e.g., "2.8/10"
  stockInfoUrl: string;
}

interface StockTableRowProps {
  row: StockRow;
  onClick: () => void;
}

const colorMapping: { [key: number]: string } = {
  0: "#e60000", // Red
  1: "#ff4500", // Orange Red
  2: "#ff8c00", // Dark Orange
  3: "#ffa500", // Orange
  4: "#ffd966", // Soft Yellow
  5: "#ffd700", // Gold
  6: "#a8d5ba", // Soft Green
  7: "#7fff00", // Chartreuse
  8: "#32cd32", // Lime Green
  9: "#00ff00", // Lime
  10: "#00e600", // Green
};

const getColor = (value: number): string => {
  const floor = Math.floor(value);
  return colorMapping[floor] || "#000000"; // Default to black if out of range
};

const StockTableRow: React.FC<StockTableRowProps> = ({ row, onClick }) => {
  const { state, updateState } = useGlobalState();

  const [openDialog, setOpenDialog] = useState(false);
  const [portfolioAmount, setPortfolioAmount] = useState("");

  const handleAddToPortfolio = () => {
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setPortfolioAmount("");
  };

  const handleAddPortfolioSubmit = () => {
    updateState({
      portfolioItems: [
        ...state.portfolioItems,
        {
          ticker: row.ticker.toUpperCase(),
          price: parseFloat(portfolioAmount),
          options: [row.environmental, row.social, row.governance],
        },
      ],
    });
    handleDialogClose();
  };

  const renderScore = (score: string) => {
    const value = parseFloat(score);
    const color = getColor(value);

    return (
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: "1.5em", color: color, fontWeight: "bold" }}>
          {score}
        </span>
        <span style={{ marginLeft: "4px", color: "#555" }}>/10</span>
      </div>
    );
  };

  return (
    <>
      <TableRow hover tabIndex={-1} key={row.ticker} onClick={onClick}>
        <TableCell align="center">
          <ImageWithFallback
            src={row.logo}
            alt={`${row.name} Logo`}
            className={styles.logo}
            height={30}
          />
        </TableCell>
        <TableCell align="left">{row.name}</TableCell>
        <TableCell align="left">{row.ticker.toUpperCase()}</TableCell>
        <TableCell align="right">{renderScore(row.environmental)}</TableCell>
        <TableCell align="right">{renderScore(row.social)}</TableCell>
        <TableCell align="right">{renderScore(row.governance)}</TableCell>
        <TableCell align="center">
          <IconButton
            aria-controls={`menu-${row.ticker}`}
            aria-haspopup="true"
            onClick={(e) => {
              e.stopPropagation();
              handleAddToPortfolio();
            }}
          >
            <AddIcon />
          </IconButton>
        </TableCell>
      </TableRow>

      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>Add to Portfolio</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter the amount in dollars for {row.name}.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id={`portfolio-amount-${row.ticker}`}
            label="Amount ($)"
            fullWidth
            variant="standard"
            type="number"
            value={portfolioAmount}
            onChange={(e) => setPortfolioAmount(e.target.value)}
            inputProps={{ min: "0", step: "0.01" }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button
            onClick={handleAddPortfolioSubmit}
            disabled={!portfolioAmount || parseFloat(portfolioAmount) <= 0}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default StockTableRow;
