export default getDeviceId;
declare function getDeviceId(facingMode: any, chooseDeviceId?: typeof defaultDeviceIdChooser): Promise<any>;
declare function defaultDeviceIdChooser(filteredDevices: any, videoDevices: any): any;
