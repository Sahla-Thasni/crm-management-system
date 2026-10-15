import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import BusinessCenterRoundedIcon from "@mui/icons-material/BusinessCenterRounded";
import AssignmentTurnedInRoundedIcon from "@mui/icons-material/AssignmentTurnedInRounded";
import PaidRoundedIcon from "@mui/icons-material/PaidRounded";

import { DashboardStat,} from "@/types/dashboard";

export const dashboardStats: DashboardStat[] = [
  {
    id: 1,
    title: "Total Leads",
    sales: "0",
    icon: GroupsRoundedIcon,
    iconColor: "#6B4EFF",
    iconBackground: "#F3EEFF",
  },
  {
    id: 2,
    title: "Active Deals",
    sales: "0",
    icon: BusinessCenterRoundedIcon,
    iconColor: "#14B8A6",
    iconBackground: "#E7FAF7",
  },
  {
    id: 3,
    title: "Closed Deals",
    sales: "0",
    icon: AssignmentTurnedInRoundedIcon,
    iconColor: "#EF4444",
    iconBackground: "#FDECEC",
  },
  {
    id: 4,
    title: "Monthly Revenue",
    sales: "$0",
    icon: PaidRoundedIcon,
    iconColor: "#F59E0B",
    iconBackground: "#FFF4DE",
  },
];
