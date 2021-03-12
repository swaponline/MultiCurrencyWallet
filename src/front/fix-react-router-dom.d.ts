/*

Fix `react-router-dom` @withRouter
Hopefully after updating the libraries it won't be needed

*/

export * from "@types/react-router"
export { RouteComponentProps } from "react-router"


declare module "react-router-dom" {
  export function withRouter<T extends RouteComponentProps<any>>(
    component?: React.ComponentType<T>
  ): any
}