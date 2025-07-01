const usb = require('usb');
const { Printer, InMemory, Align, Image, Model } = require('escpos-buffer');
const { ImageManager } = require('escpos-buffer-image');

// Environment variables for printer vendor and product ID
const VENDOR_ID = parseInt(process.env.VENDOR_ID, 16);
const PRODUCT_ID = parseInt(process.env.PRODUCT_ID, 16);
// const VENDOR_ID = process.env.VENDOR_ID;
// const PRODUCT_ID = process.env.PRODUCT_ID;
const logoPath = process.env.LOGO_PATH;
console.log('VENDOR_ID:', VENDOR_ID);
console.log('PRODUCT_ID:', PRODUCT_ID);
// Helper function to connect to the printer
function connectToPrinter() {
  const device = usb.findByIds(VENDOR_ID, PRODUCT_ID);
  if (!device) throw new Error('Printer device not found');

  try {
    device.open();
    const iface = device.interfaces[0];
    iface.claim();
    const outEndpoint = iface.endpoints.find((ep) => ep.direction === 'out');
    if (!outEndpoint) throw new Error('Output endpoint not found');
    return { device, outEndpoint };
  } catch (error) {
    if (device) device.close();
    throw error;
  }
}

// Main function to print a receipt
async function printReceipt(bodyContent, newLogo) {
  const { device, outEndpoint } = connectToPrinter();

  try {
    const connection = new InMemory();
    const imageManager = new ImageManager();
    const printer = await Printer.CONNECT('POS-80', connection, imageManager);

    await printer.withStyle({
      width: 60,
      height: 48,
      font: 'b',
      align: Align.Center,
      size: [1, 1],
      bold: true,
    }, async () => {
      // Print header
      await printHeader(printer, newLogo);

      // Print dynamic body content
      await printer.writeln(bodyContent);

      // Print footer
      await printFooter(printer);
    });

    // Finalize print
    await printer.feed(4);
    await printer.cutter();

    // Send data to the printer
    return new Promise((resolve, reject) => {
      outEndpoint.transfer(connection.buffer(), (err) => {
        if (err) {
          reject(err);
        } else {
          console.log('Receipt printed successfully!');
          resolve();
        }
        device.close();
      });
    });
  } catch (err) {
    console.error('Error printing receipt:', err);
    if (device) device.close();
    throw err;
  }
}

// Helper function to print the header
async function printHeader(printer,newLogo) {

    try {
      const imageManager = new ImageManager();
      const imageData = await imageManager.loadImage(newLogo||logoPath);
      const logo = new Image(imageData);
      await printer.draw(logo);
    } catch (error) {
      console.error('Error loading logo:', error);
    }
    await printer.writeln('*** Receipt ***', { align: Align.Center, bold: true });
    await printer.writeln(`Date: ${new Date().toLocaleString()}`, { align: Align.Left });
    await printer.writeln('------------------------------------------------', { align: Align.Center });
  }


// Helper function to print the footer
async function printFooter(printer) {
  await printer.writeln('------------------------------------------------', { align: Align.Center });
  await printer.writeln('Thank You! Visit Again!', { align: Align.Center });
}

// Function to print a recharge receipt
async function printRechargeReceipt(rfidCard,name, amount, balance) {
  const bodyContent = `
    RFID: ${rfidCard}
    NAME: ${name}
    Recharge Amount: Rs ${amount}
    Current Balance: Rs ${balance}
  `;
  await printReceipt(bodyContent);
}

// Function to print a deduction receipt
async function printDeductionReceipt(rfidCard,name, amount, balance) {
    const bodyContent = `
    RFID: ${rfidCard}
    NAME: ${name}
    Recharge Amount: Rs ${amount}
    Current Balance: Rs ${balance}
  `;
  await printReceipt(bodyContent);
}

// Function to print a meal receipt
async function printMealReceipt(rfidCard, planName, mealType,mealsLeft, expiryDate, thaliType) {
  
  const bodyContent = `
    RFID: ${rfidCard}
    Plan: ${planName}
    Meal: ${mealType}
    Meals Left: ${mealsLeft}
    Plan Expiry: ${expiryDate.toLocaleDateString()}
  `;
  console.log(thaliType);
  if(thaliType==80){
    
    await printReceipt(bodyContent,'static/test/eighty.png');
  }
  else if(thaliType==100){
    
    await printReceipt(bodyContent,'static/test/hundred.png');
  }else{

    await printReceipt(bodyContent);
  }
}

// Function to test the printer
async function testPrint() {
  const bodyContent = `
    Test Print Successful
    Date: ${new Date().toLocaleString()}
    Thank You for Testing!
  `;
  await printReceipt(bodyContent);
}

// Export all functions
module.exports = {
  connectToPrinter,
  printReceipt,
  printRechargeReceipt,
  printDeductionReceipt,
  printMealReceipt,
  testPrint,
};
