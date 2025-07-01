const usb = require('usb');

// ✅ Simple function: List all USB devices
function listAllUsbDevices() {
    const devices = usb.getDeviceList();
    const deviceList = [];

    devices.forEach((device) => {
        const deviceDesc = device.deviceDescriptor;

        deviceList.push({
            vendorId: `0x${deviceDesc.idVendor.toString(16).padStart(4, '0')}`,
            productId: `0x${deviceDesc.idProduct.toString(16).padStart(4, '0')}`,
        });
    });

    return deviceList;
}

// ✅ Optional: Filter known printers (if you want)
const knownVendors = [
    '0x04b8', // Epson
    '0x0fe6', // Retsol
    '0x28e9', // Rongta
    '0x1234'  // You can add your known printers
];

function listUsbPrinters() {
    const allDevices = listAllUsbDevices();
    return allDevices.filter(device => knownVendors.includes(device.vendorId));
}

// ✅ Exported module
module.exports = { 
    listAllUsbDevices, 
    listUsbPrinters 
};
