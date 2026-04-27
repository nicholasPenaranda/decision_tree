//html variable calls made here
const resetButton = document.querySelector("#reset");
const resetYes = document.querySelector("#resetYes");
const resetNo = document.querySelector("#resetNo");
const resetConfirm = document.getElementById("resetConfirm");
const issueType = document.querySelector("#issueType");
const radioTypeInput = document.querySelector("#radioType");
const complaint = document.querySelector("#complaint");
const complaintType = document.querySelector("#complaintType");
const selectButton = document.querySelector("#selectButton");
const previousPrompts = document.getElementById("previousPrompts");
const options = document.querySelector("#options");
const issueResolved = document.querySelector("#issueResolved");
const notHome = document.querySelector("#notHome");
const earlyEscalate = document.querySelector("#earlyEscalate");
const intermittentRestored = document.getElementById(
  "intermittentConnectionRestoredConnection"
);
const createTicketButton = document.querySelector("#ticketButton");
const clipboardConfirm = document.getElementById("clipboardConfirm");
const pageCoverAll = document.querySelectorAll(".pageCover");
const settingsContainer = document.getElementById("settingsContainer");
const settingsButton = document.getElementById("settingsButton");
const settingsConfirm = document.getElementById("settingsConfirm");
const settingsCancel = document.getElementById("settingsCancel");
const font = document.getElementById("font");
const notesFont = document.getElementById("notesFont");
const background = document.getElementById("background");
const foreground = document.getElementById("foreground");
const textColor = document.getElementById("textColor");
const linkColor = document.getElementById("linkColor");
const inputTextColor = document.getElementById("inputTextColor");
const inputBackgroundColor = document.getElementById("inputBackgroundColor");
const resetRadioOn = document.getElementById("resetRadioOn");
const resetRadioOff = document.getElementById("resetRadioOff");
const defaultButton = document.getElementById("defaultButton");
const resetDefaultContainer = document.getElementById("resetDefaultContainer");
const defaultYes = document.getElementById("defaultYes");
const defaultNo = document.getElementById("defaultNo");
const cog = document.getElementById("cog");
const defaultSettings = {
  font: "12",
  notesFont: "20",
  background: "#212121",
  foreground: "#303030",
  textColor: "#ffffff",
  linkColor: "#ffff00",
  inputTextColor: "#000000",
  inputBackgroundColor: "#ffffff",
  resetPrompt: true
};

//general variable calls made here
let complaintSelect;
let radioType = "ubiquiti";
let eventCheck = false;
let resetPrompt = true;
let settings = {};
let test = false;

//error message for incorrect path in tree
const error = { prompt: "Not pathed correctly", options: { exit: "exit" } };

//storage for trees
const resolved = {
  prompt: "The customer's issues are resolved.",
  options: {
    "Create Ticket": "exit"
  }
};
const billingEscalate = {
  prompt: "Transfer to Billing.",
  options: {
    "Create Ticket": "exit"
  }
};
const updateRouter = {
  prompt:
    "If they have our router and its firmware isn't version 6.49.6 please make sure to update it",
  options: {
    continue: resolved
  }
};
const escalate = {
  prompt: "Escalate the call to Tier 2.",
  options: {
    "Create Ticket": "exit"
  }
};
const outage = {
  prompt:
    "Let the customer know we are working to restore the outage. If they ask for an ETA only provide one if you are given one.",
  options: {
    "Create Ticket": "exit"
  }
};
const reseat = {
  prompt:
    "Verify with the customer that from the PoE there is a cable going from the port labeled PoE or OUT that leads outside, and the other port labeled LAN or IN leads to the correct port on the router/mesh.",
  options: {
    continue: () => {
      return {
        prompt:
          "Have the customer reseat both cables in the PoE including the cable end in the router/mesh.",
        options: {
          continue: () => {
            return {
              prompt:
                "Ask the customer and note if they noticed any damage to the cable ends while they were reseating them.",
              options: {
                continue: () => {
                  return {
                    prompt:
                      "Verify with the customer and make note if there are no power lights on either the router and the PoE.",
                    options: {
                      "Issue is resolved.": () => {
                        if (complaintSelect === "intermittentConnection") {
                          let path;
                          switch(radioType) {
                            case "ubiquiti":
                              path = tree.technicalSupport[radioType].slowSpeeds.options.continue.options.yes.options.continue.options.yes;
                              break;
                            case "mimosa":
                            case "cambium":
                              path = tree.technicalSupport[radioType].slowSpeeds.options.continue.options.yes;
                              break;
                            case "tarana":
                              path = tree.technicalSupport[radioType].slowSpeeds.options.continue.options.yes.options.yes;
                              break;
                            default:
                              path = tree.technicalSupport[radioType].slowSpeeds.options.continue;
                              break;
                          }
                          intermittentRestored.style.cssText = "display:none;";
                          return path;
                        } else {
                          return resolved;
                        }
                      },
                      "Issue isn't resolved.": escalate
                    }
                  };
                }
              }
            };
          }
        }
      };
    }
  }
};
const routerCheck = {
  prompt: "Is this a customer owned router?",
  options: {
    yes: reseat,
    no: () => {
      return {
        prompt: "Are you able to access the router?",
        options: {
          yes: () => {
            return {
              prompt:
                "Ensure that the router/mesh is up to date on firmware and has optimal settings (if they instead only have a motorolla or nova mesh continue)" /*"\nChannel Width: 20MHz\nFrequency: auto\nFrequency Mode: regulatory-domain\nCountry: united states3\nInstallation: indoor\nWMM Support: Enabled"*/,
              options: {
                continue: () => {
                  return {
                    prompt:
                      "Ensure that the router/mesh frequency isn't the same as the radio and then check ping and bandwidth from the router/mesh.",
                    options: {
                      continue: () => {
                        return {
                          prompt: "Is the customer able to confirm connection?",
                          options: {
                            yes: () => {
                              if (
                                complaintSelect === "intermittentConnection"
                              ) {
                                intermittentRestored.style.cssText =
                                  "display:none;";
                                return tree.technicalSupport[radioType]
                                  .slowSpeeds;
                              } else {
                                return resolved;
                              }
                            },
                            no: escalate
                          }
                        };
                      }
                    }
                  };
                }
              }
            };
          },
          no: reseat
        }
      };
    }
  }
};
const password = {
  prompt:
    "Verify, at the minimum, two pieces of the customer's account information then provide or change the password in the router.",
  options: {
    "Create Ticket": "exit"
  }
};
const other = {
  prompt: "Please note why other is selected.",
  options: {
    "Create Ticket": "exit"
  }
};

//initial starting trees

const tree = {
  technicalSupport: {
    ubiquiti: {
      noConnection: {
        prompt: "Power cycle the customer's equipment.",
        options: {
          continue: () => {
            return {
              prompt: "Are you able to access the AP?",
              options: {
                yes: () => {
                  return {
                    prompt: "Are you able to see the radio in the AP?",
                    options: {
                      yes: () => {
                        return {
                          prompt:
                            "Does the radio have a default IP that starts with 192.168?",
                          options: {
                            yes: () => {
                              return {
                                prompt: "Kick the radio from the AP.",
                                options: {
                                  "Still showing as default": reseat,
                                  "The radio now shows one of our IPs": () => {
                                    return tree.technicalSupport.ubiquiti.noConnection.options
                                      .continue()
                                      .options.yes()
                                      .options.yes()
                                      .options.no();
                                  }
                                }
                              };
                            },
                            no: () => {
                              return {
                                prompt: "Are you able to access the radio?",
                                options: {
                                  yes: () => {
                                    return {
                                      prompt:
                                        "Are you able to see a link of 1000mbps or 100mbps Full?",
                                      options: {
                                        yes: () => {
                                          return routerCheck;
                                        },
                                        no: reseat
                                      }
                                    };
                                  },
                                  no: reseat
                                }
                              };
                            }
                          }
                        };
                      },
                      no: reseat
                    }
                  };
                },
                no: {
                  prompt: "Is your VPN correctly set?",
                  options: {
                    yes: {
                      prompt: "Is there an outage?",
                      options: {
                        yes: outage,
                        no: escalate
                      }
                    },
                    "It is corrected now": () => {
                      return tree.technicalSupport.ubiquiti.noConnection.options
                        .continue()
                        .options.yes();
                    }
                  }
                }
              }
            };
          }
        }
      },
      intermittentConnection: {
        prompt: "Are the services currently down?",
        options: {
          yes: () => {
            return tree.technicalSupport.ubiquiti.noConnection;
          },
          no: () => {
            intermittentRestored.style.cssText = "display:none;";
            return tree.technicalSupport.ubiquiti.slowSpeeds;
          }
        }
      },
      slowSpeeds: {
        prompt: "Power cycle the customer's equipment.",
        options: {
          continue: {
            prompt: "Is the AP accessible?",
            options: {
              yes: {
                prompt:
                  "While in the AP please make note if you see most customer's showing poor throughput or signal, if you see a customer with over 40% utilization, or if the AP link is showing less than 1000mbps.",
                options: {
                  continue: {
                    prompt: "Are you able to access the Radio?",
                    options: {
                      yes: {
                        prompt:
                          "Does the radio firmware match the AP firmware?",
                        options: {
                          yes: {
                            prompt:
                              "Note if throughput capacity is low, signal is high, or if the link is not 1000 full.",
                            options: {
                              continue: {
                                prompt: "Is this a customer owned router?",
                                options: {
                                  yes: reseat,
                                  no: {
                                    prompt:
                                      "Ensure that the router/mesh is up to date on firmware and has optimal settings (if they instead only have a motorolla or nova mesh continue)" /*"\nChannel Width: 20MHz\nFrequency: auto\nFrequency Mode: regulatory-domain\nCountry: united states3\nInstallation: indoor\nWMM Support: Enabled"*/,
                                    options: {
                                      continue: {
                                        prompt:
                                          "Ensure that the router/mesh frequency isn't the same as the radio and then check ping and bandwidth from the router/mesh",
                                        options: {
                                          continue: {
                                            prompt:
                                              "Can the customer see speeds now?",
                                            options: {
                                              yes: resolved,
                                              no: escalate
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          },
                          //prompt and path "Does the radio firmware match the AP firmware" tree.technicalSupport.ubiquiti.slowSpeeds.options.yes.options.continue.option["no"]
                          no: {
                            prompt:
                              "Update the radio only if the AP is on current firmware",
                            options: {
                              continue: () => {
                                return tree.technicalSupport.ubiquiti.slowSpeeds
                                  .options.continue.options.yes.options.continue
                                  .options.yes.options.yes;
                              }
                            }
                          }
                        }
                      },
                      //prompt and path "Are you able to access the Radio?" tree.technicalSupport.ubiquiti.slowSpeeds.options.yes.options["no"]
                      no: reseat
                    }
                  }
                }
              },
              //prompt and path "Are you able to access the AP?" tree.technicalSupport.ubiquiti.slowSpeeds.options["no"]
              no: escalate
            }
          }
        }
      },
      outage: outage,
      password: password,
      other: other
    },
    telrad: {
      noConnection: {
        prompt: "Power cycle the customer's equipment.",
        options: {
          continue: () => {
            return {
              prompt: "Is it airspan?",
              options: {
                yes: () => {
                  return reseat;
                },
                no: () => {
                  return {
                    prompt:
                      "Looking at breezeview is the PCI/Cell for the customer up?",
                    options: {
                      yes: () => {
                        return {
                          prompt: "Are you able to access the radio?",
                          options: {
                            yes: () => {
                              return routerCheck;
                            },
                            no: () => {
                              return reseat;
                            }
                          }
                        };
                      },
                      no: () => {
                        return escalate;
                      }
                    }
                  };
                }
              }
            };
          }
        }
      },
      intermittentConnection: {
        prompt: "Are services currently down?",
        options: {
          yes: () => {
            return tree.technicalSupport.telrad.noConnection;
          },
          no: () => {
            intermittentRestored.style.cssText = "display:none;";
            return tree.technicalSupport.telrad.slowSpeeds;
          }
        }
      },
      slowSpeeds: {
        prompt: "Power cycle the customer's equipment.",
        options: {
          continue: {
            prompt:
              "If not on airspan make note if the cell the customer on is showing utilization over 80%",
            options: {
              continue: {
                prompt:
                  "Note if the customer's current radio stats are worse compared to their install.",
                options: {
                  continue: {
                    prompt: "Is this a customer owned router?",
                    options: {
                      yes: reseat,
                      no: {
                        prompt:
                          "Ensure that the router/mesh is up to date on firmware and has optimal settings (if they instead only have a motorolla or nova mesh continue)" /*"\nChannel Width: 20MHz\nFrequency: auto\nFrequency Mode: regulatory-domain\nCountry: united states3\nInstallation: indoor\nWMM Support: Enabled"*/,
                        options: {
                          continue: {
                            prompt:
                              "Ensure that the router/mesh frequency isn't the same as the radio and then check ping and bandwidth from the router/mesh.",
                            options: {
                              continue: escalate
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      outage: outage,
      password: password,
      other: other
    },
    mimosa: {
      noConnection: {
        prompt: "Power cycle the customer's equipment.",
        options: {
          continue: () => {
            return {
              prompt: "Are you able to access the AP?",
              options: {
                yes: () => {
                  return {
                    prompt: "Are you able to see the radio in the AP",
                    options: {
                      yes: () => {
                        return {
                          prompt: "Are you able to access the radio",
                          options: {
                            yes: () => {
                              return {
                                prompt:
                                  "Do you see a link of 1000 or 100mbps full?",
                                options: {
                                  yes: routerCheck,
                                  no: reseat
                                }
                              };
                            },
                            no: reseat
                          }
                        };
                      },
                      no: reseat
                    }
                  };
                },
                no: () => {
                  return {
                    prompt: "Is your VPN correctly set?",
                    options: {
                      yes: () => {
                        return {
                          prompt: "Is there an outage?",
                          options: {
                            yes: outage,
                            no: escalate
                          }
                        };
                      },
                      "It is corrected now": () => {
                        return tree.technicalSupport.mimosa.noConnection.options
                          .continue()
                          .options.yes();
                      }
                    }
                  };
                }
              }
            };
          }
        }
      },
      intermittentConnection: {
        prompt: "Are services currently down?",
        options: {
          yes: () => {
            return tree.technicalSupport.mimosa.noConnection;
          },
          no: () => {
            intermittentRestored.style.cssText = "display:none;";
            return tree.technicalSupport.mimosa.slowSpeeds;
          }
        }
      },
      slowSpeeds: {
        prompt: "Power cycle the customer's equipment.",
        options: {
          continue: {
            prompt: "Is the AP accessible",
            options: {
              yes: {
                prompt:
                  "Make note if over half the customers on the AP are showing low SINR, if a customer is showing over 40% utilization, or if the AP link is showing less than 1000mbps.",
                options: {
                  continue: {
                    prompt: "Are you able to access the radio?",
                    options: {
                      yes: {
                        prompt: "Note if any of the radios stats look poor",
                        options: {
                          continue: {
                            prompt: "Is this a customer owned router?",
                            options: {
                              yes: reseat,
                              no: {
                                prompt:
                                  "Ensure that the router/mesh is up to date on firmware and has optimal settings (if they instead only have a motorolla or nova mesh continue)" /*"\nChannel Width: 20MHz\nFrequency: auto\nFrequency Mode: regulatory-domain\nCountry: united states3\nInstallation: indoor\nWMM Support: Enabled"*/,
                                options: {
                                  continue: {
                                    prompt:
                                      "Ensure that the router/mesh frequency isn't the same as the radio and then check ping and bandwidth from the router/mesh.",
                                    options: {
                                      continue: {
                                        prompt:
                                          "Can the customer see speeds now?",
                                        options: {
                                          yes: resolved,
                                          no: escalate
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      },
                      no: reseat
                    }
                  }
                }
              },
              no: escalate
            }
          }
        }
      },
      outage: outage,
      password: password,
      other: other
    },
    cambium: {
      noConnection: {
        prompt: "Power cycle the customer's equipment.",
        options: {
          continue: () => {
            return {
              prompt: "Are you able to access the AP?",
              options: {
                yes: () => {
                  return {
                    prompt: "Are you able to see the radio in the AP",
                    options: {
                      yes: () => {
                        return {
                          prompt: "Are you able to access the radio",
                          options: {
                            yes: () => {
                              return {
                                prompt:
                                  "Do you see a link of 1000 or 100mbps full?",
                                options: {
                                  yes: routerCheck,
                                  no: reseat
                                }
                              };
                            },
                            no: reseat
                          }
                        };
                      },
                      no: reseat
                    }
                  };
                },
                no: () => {
                  return {
                    prompt: "Is your VPN correctly set?",
                    options: {
                      yes: () => {
                        return {
                          prompt: "Is there an outage?",
                          options: {
                            yes: outage,
                            no: escalate
                          }
                        };
                      },
                      "It is corrected now": () => {
                        return tree.technicalSupport.cambium.noConnection.options
                          .continue()
                          .options.yes();
                      }
                    }
                  };
                }
              }
            };
          }
        }
      },
      intermittentConnection: {
        prompt: "Are services currently down?",
        options: {
          yes: () => {
            return tree.technicalSupport.cambium.noConnection;
          },
          no: () => {
            intermittentRestored.style.cssText = "display:none;";
            return tree.technicalSupport.cambium.slowSpeeds;
          }
        }
      },
      slowSpeeds: {
        prompt: "Power cycle the customer's equipment.",
        options: {
          continue: {
            prompt: "Is the AP accessible",
            options: {
              yes: {
                prompt:
                  "Make note if the AP link is showing less than 1000mbps.",
                options: {
                  continue: {
                    prompt: "Are you able to access the radio?",
                    options: {
                      yes: {
                        prompt: "Note if any of the radios stats look poor",
                        options: {
                          continue: {
                            prompt: "Is this a customer owned router?",
                            options: {
                              yes: reseat,
                              no: {
                                prompt:
                                  "Ensure that the router/mesh is up to date on firmware and has optimal settings (if they instead only have a motorolla or nova mesh continue)" /*"\nChannel Width: 20MHz\nFrequency: auto\nFrequency Mode: regulatory-domain\nCountry: united states3\nInstallation: indoor\nWMM Support: Enabled"*/,
                                options: {
                                  continue: {
                                    prompt:
                                      "Ensure that the router/mesh frequency isn't the same as the radio and then check ping and bandwidth from the router/mesh.",
                                    options: {
                                      continue: {
                                        prompt:
                                          "Can the customer see speeds now?",
                                        options: {
                                          yes: resolved,
                                          no: escalate
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      },
                      no: reseat
                    }
                  }
                }
              },
              no: escalate
            }
          }
        }
      },
      outage: outage,
      password: password,
      other: other
    },
    tarana: {
      noConnection: {
        prompt: "Power cycle the customer's equipment.",
        options: {
          continue: () => {
            return {
              prompt: "Is the BN showing as up?",
              options: {
                yes: () => {
                  return {
                    prompt: "Are you able to access the WebUI?",
                    options: {
                      yes: () => {
                        return {
                          prompt: "Do you see a link of 1000mbps full?",
                          options: {
                            yes: routerCheck,
                            no: reseat
                          }
                        };
                      },
                      no: reseat
                    }
                  };
                },
                no: () => {
                  return {
                    prompt: "Is there an outage?",
                    options: {
                      yes: outage,
                      no: escalate
                    }
                  };
                }
              }
            };
          }
        }
      },
      intermittentConnection: {
        prompt: "Are services currently down?",
        options: {
          yes: () => {
            return tree.technicalSupport.tarana.noConnection;
          },
          no: () => {
            intermittentRestored.style.cssText = "display:none;";
            return tree.technicalSupport.tarana.slowSpeeds;
          }
        }
      },
      slowSpeeds: {
        prompt: "Power cycle the customer's equipment.",
        options: {
          continue: {
            prompt: "Is the AP currently up?",
            options: {
              yes: {
                prompt: "Are you able to access the radios WebUI?",
                options: {
                  yes: {
                    prompt: "Note if any of the radios stats look poor",
                    options: {
                      continue: {
                        prompt: "Is this a customer owned router?",
                        options: {
                          yes: reseat,
                          no: {
                            prompt:
                              "Ensure that the router is up to date on firmware and has optimal settings" /*"\nChannel Width: 20MHz\nFrequency: auto\nFrequency Mode: regulatory-domain\nCountry: united states3\nInstallation: indoor\nWMM Support: Enabled"*/,
                            options: {
                              continue: {
                                prompt: "Can the customer see speeds now?",
                                options: {
                                  yes: resolved,
                                  no: escalate
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  },
                  no: reseat
                }
              },
              no: escalate
            }
          }
        }
      },
      outage: outage,
      password: password,
      other: other
    },
    apartments: {
      noConnection: {
        prompt:
          "Does the cusotmer have an accesible PoE and radio or just a router?",
        options: {
          radio: {
            prompt: "which radio?",
            options: {
              Ubiquiti: () => {
                radioType = "ubiquiti";
                return tree["technicalSupport"][radioType][complaintSelect];
              },
              Telrad: () => {
                radioType = "telrad";
                return tree["technicalSupport"][radioType][complaintSelect];
              },
              Mimosa: () => {
                radioType = "mimosa";
                return tree["technicalSupport"][radioType][complaintSelect];
              },
              Cambium: () => {
                radioType = "cambium";
                return tree["technicalSupport"][radioType][complaintSelect];
              },
              Tarana: () => {
                radioType = "tarana";
                return tree["technicalSupport"][radioType][complaintSelect];
              }
            }
          },
          router: {
            prompt: "Power cycle the customer's equipment.",
            options: {
              continue: {
                prompt:
                  "Verify with the customer that from the cable that leads outside leads to the correct port on the router/mesh.",
                options: {
                  continue: () => {
                    return {
                      prompt:
                        "Have the customer reseat the cables in the PoE and in the router.",
                      options: {
                        continue: () => {
                          return {
                            prompt:
                              "Ask the customer and note if they noticed any damage to the cable ends while they were reseating them.",
                            options: {
                              continue: () => {
                                return {
                                  prompt:
                                    "Verify with the customer and make note if there are no power lights on the router.",
                                  options: {
                                    "Issues resolved": resolved,
                                    "Services are still affected": escalate
                                  }
                                };
                              }
                            }
                          };
                        }
                      }
                    };
                  }
                }
              }
            }
          }
        }
      },
      intermittentConnection: {
        prompt:
          "Does the cusotmer have an accesible PoE and radio or just a router?",
        options: {
          radio: () =>
            tree.technicalSupport.apartments.noConnection.options.radio,
          router: () =>
            tree.technicalSupport.apartments.noConnection.options.router
        }
      },
      slowSpeeds: {
        prompt:
          "Does the cusotmer have an accesible PoE and radio or just a router?",
        options: {
          radio: () =>
            tree.technicalSupport.apartments.noConnection.options.radio,
          router: () =>
            tree.technicalSupport.apartments.noConnection.options.router
        }
      },
      outage: outage,
      password: password,
      other: other
    }
  },
  billing: {
    payment: {
      prompt: "Is the account in a status other than active?",
      options: {
        yes: billingEscalate,
        no: {
          prompt:
            "After taking the customer payment do they need anything else?",
          options: {
            extension: () => {
              return tree.billing.extension.options.no;
            },
            other: () => {
              return tree.billing.other;
            },
            no: resolved
          }
        }
      }
    },
    extension: {
      prompt: "Is the account in a status other than active?",
      options: {
        yes: billingEscalate,
        no: {
          prompt:
            "Do they need an extension beyond fourteen days after their due date?",
          options: {
            yes: {
              prompt: "Can the customer pay 50% of the bill?",
              options: {
                yes: {
                  prompt:
                    "We can only extend up to the day before their next invoice.",
                  options: {
                    "Customer needs more time": billingEscalate,
                    "This works for the customer": () => {
                      return tree.billing.extension.options.no.options.no;
                    }
                  }
                },
                no: billingEscalate
              }
            },
            no: {
              prompt:
                "After setting up the extension for the customer do they need anything else?",
              options: {
                payment: () => {
                  return tree.billing.payment.options.no;
                },
                other: () => {
                  return tree.billing.other;
                },
                no: resolved
              }
            }
          }
        }
      }
    },
    other: billingEscalate
  }
};

//Eventlisteners
//listens for reset button press
reset.addEventListener("click", () => {
  if (resetPrompt) {
    resetConfirm.style.cssText = "display: flex;";
  } else {
    resetPage();
  }
});
//listens for click on either yes or no for resetConfirm
resetYes.addEventListener("click", resetPage);
resetNo.addEventListener("click", () => {
  resetConfirm.style.cssText = "display: none;";
});
//listens for change in issueType and radioType option
issueType.addEventListener("change", issueTypeChange);
radioTypeInput.addEventListener("change", colorChange);
//listens for select button press and brings up the current radio stat inputs
selectButton.addEventListener("click", () => {
  radioType = document.querySelector("#radioType").value;
  let treeRef;
  const radios = document.querySelectorAll(".radioInfo");

  if (issueType.value === "technicalSupport") {
    treeRef = tree[issueType.value][radioType][complaintType.value];
  } else {
    treeRef = tree.billing[complaintType.value];
  }

  for (let i = 0; i < radios.length; i++) {
    radios[i].style.display = "none";
  }

  currentRadio = document.getElementById(radioType + "Radio");
  complaintSelect = complaintType.value;

  currentRadio.style.display = "grid";
  intermittentRestored.style.cssText = "display:none;";
  document.getElementById("additionalOptions").style.cssText = "display:block;";
  previousPrompts.innerHTML = "";

  selectHandler(treeRef.options, treeRef.prompt);
});
//listeners for the additional options
issueResolved.addEventListener("click", () => {
  if (additionalOptionCheck()) {
    return;
  }
  selectHandler(resolved.options, resolved.prompt, " - resolved");
});
notHome.addEventListener("click", () => {
  if (additionalOptionCheck()) {
    return;
  }
  selectHandler(
    { "Create Ticket": "exit" },
    "Ask the customer to call back when they are available to troubleshoot",
    " - customer is not home to troubleshoot"
  );
});
earlyEscalate.addEventListener("click", () => {
  if (additionalOptionCheck()) {
    return;
  }
  selectHandler(
    escalate.options,
    "Please note why you are escalating",
    " - escalate"
  );
});
intermittentRestored.addEventListener("click", () => {
  intermittentRestored.style.cssText = "display:none;";
  selectHandler(
    tree.technicalSupport[radioType].slowSpeeds.options.continue.options,
    tree.technicalSupport[radioType].slowSpeeds.options.continue.prompt,
    " - connection restored"
  );
});
//Listens for create ticket button click
createTicketButton.addEventListener("click", createTicket);
//Listens for click on clipboard confirmation div
clipboardConfirm.addEventListener("click", () => {
  clipboardConfirm.style.display = "none";
});
//Listens for click on background of page covering popups
for (let i = 0; i < pageCoverAll.length; i++) {
  pageCoverAll[i].addEventListener("click", (e) => {
    if (e.target.classList.contains("pageCover")) {
      e.target.style.cssText = "display:none;";
    } else if (e.target.parentNode.classList.contains("pageCover")) {
      e.target.parentNode.style.cssText = "display:none;";
    }
  });
}
// listens for click on the settings cog button
settingsButton.addEventListener("click", () => {
  setSettingsTab();
  if (settingsContainer.style.display === "flex") {
    settingsContainer.style.cssText = "display: none;";
    cog.style.transform = "rotate(0deg)";
  } else {
    settingsContainer.style.cssText = "display: flex;";
    cog.style.transform = "rotate(180deg)";
  }
});
// listens for click on the cancel button in the settings tab to close the tab
settingsCancel.addEventListener("click", () => {
  setSettingsTab();
  settingsContainer.style.cssText = "dispaly: none;";
  cog.style.transform = "rotate(0deg)";
});
// listens for a click on the confirmation button in settings tab to start updating settings
settingsConfirm.addEventListener("click", updateStorage);
// listens for change/input for the range for the fonts
font.addEventListener("input", () => {
  fontExample("font");
});
notesFont.addEventListener("input", () => {
  fontExample("notesFont");
});
// listens for click on the default settings buttons
defaultButton.addEventListener("click", () => {
  resetDefaultContainer.style.cssText = "display: flex;";
});
defaultYes.addEventListener("click", () => {
  settings = defaultSettings;
  updateSettings();
  localStorage.setItem("settings", JSON.stringify(settings));

  resetDefaultContainer.style.cssText = "display: none;";
});
defaultNo.addEventListener("click", () => {
  resetDefaultContainer.style.cssText = "display: none;";
});

//functions
//removes current options for complaint type and adds new ones that match issue type
function issueTypeChange() {
  const complaintStore = {
    technicalSupport: [
      { label: "No Connection", value: "noConnection" },
      { label: "Intermittent Connection", value: "intermittentConnection" },
      { label: "Slow Speeds", value: "slowSpeeds" },
      { label: "Outage", value: "outage" },
      { label: "Password", value: "password" },
      { label: "Other", value: "other" }
    ],
    billing: [
      { label: "Payment", value: "payment" },
      { label: "Extension", value: "extension" },
      { label: "Other", value: "other" }
    ]
  };
  complaintType.innerHTML = "";
  const tempIssue = complaintStore[issueType.value];
  for (let i = 0; i < tempIssue.length; i++) {
    const newOption = document.createElement("option");
    const optionText = document.createTextNode(tempIssue[i].label);
    newOption.value = tempIssue[i].value;
    newOption.appendChild(optionText);
    complaintType.appendChild(newOption);
  }
}

//handles select button, prompt back tracking, and option selections
function selectHandler(node, text, previousOption = "") {
  const tempNode = node;
  const addingPrompt = document.createElement("li");
  const textNode = document.createElement("span");
  createTicketButton.style.cssText = "display:none;";

  textNode.innerHTML = text;
  textNode.addEventListener("mouseup", () => {
    let bool = true;
    while (bool) {
      if (previousPrompts.lastChild.innerText.includes(text)) {
        bool = false;
      }
      previousPrompts.lastChild.remove();
    }
    selectHandler(tempNode, text, previousOption);
  });
  addingPrompt.appendChild(textNode);
  previousPrompts.appendChild(addingPrompt);
  eventListenerCheck(text);
  if (previousPrompts.lastChild.previousSibling) {
    if (
      !previousPrompts.lastChild.previousSibling
        .querySelector("span")
        .innerText.includes(previousOption)
    ) {
      previousPrompts.lastChild.previousSibling.querySelector(
        "span"
      ).innerText += previousOption;
    }
  }
  options.innerHTML = "";
  if (tempNode === "exit") {
    createTicket();
    return;
  }
  Object.keys(tempNode).forEach((key) => {
    const optionElement = document.createElement("li");
    const optionTextNode = document.createElement("span");
    let temp = tempNode[key];
    optionTextNode.appendChild(document.createTextNode(key));

    if (key === "Create Ticket") {
      createTicketButton.style.cssText = "display:block;";
      return;
    }
    if (typeof tempNode[key] === "function") {
      intermittentCheck();
      temp = temp();
    }

    optionTextNode.addEventListener("click", () => {
      if (temp === "exit") {
        selectHandler(temp, "exit");
        return;
      }

      selectHandler(temp.options, temp.prompt, " - " + key);
    });

    optionElement.appendChild(optionTextNode);
    options.appendChild(optionElement);
  });
}

//used in the createTicket() function to find labels to match the inputs
function findLabel(e) {
  const labels = document.getElementsByTagName("label");
  let idValue = e.id;
  for (let i = 0; i < labels.length; i++) {
    if (labels[i].htmlFor == idValue) return labels[i].innerHTML;
  }
}

//creates the ticket and clipboards it
function createTicket() {
  const customerInfo = document.querySelector("#customerInfo");
  const customer = customerInfo.querySelectorAll("input")[0].value;
  const customerID = customerInfo.querySelectorAll("input")[1].value;
  const customerPhoneNumber = customerInfo.querySelectorAll("input")[2].value;
  const currentRadio = document.getElementById(radioType + "Radio");
  let tempRadioType = radioType.split("");
  tempRadioType[0] = tempRadioType[0].toUpperCase();
  tempRadioType = tempRadioType.join("");
  let tempComplaint = complaintType.value;
  switch (tempComplaint) {
    case "noConnection":
      tempComplaint = "No Connection";
      break;
    case "intermittentConnection":
      tempComplaint = "Intermittent Connection";
      break;
    case "slowSpeeds":
      tempComplaint = "Slow Speeds";
      break;
    default:
      break;
  }
  let ticket = tempRadioType + "\n\n" + "Complaint: " + tempComplaint + "\n\n";
  let currentLabel;
  let currentInput;
  let remoteSignal;
  let currentId;
  for (let m = 0; m < currentRadio.querySelectorAll("input").length; m++) {
    currentInput = currentRadio.querySelectorAll("input")[m];
    currentId = currentInput.id;
    if (currentInput.value) {
      if (currentInput.id === "remoteSignal") {
        remoteSignal = currentInput.value;
        continue;
      } else if (currentId.includes("Chains")) {
        if (currentId.includes("remote")) {
          ticket += `Remote Signal: -${remoteSignal} Δ${currentInput.value}\n`;
          continue;
        } else {
          ticket += ` Δ${currentInput.value}\n`;
          continue;
        }
      }
      currentLabel = findLabel(currentInput);
      ticket += `${currentLabel}${
        currentId.includes("signal") ||
        currentId.includes("Signal") ||
        currentId.includes("Noise")
          ? " -"
          : " "
      }${currentInput.value}`;
      switch (currentLabel) {
        case "Ping:":
          ticket += " ms";
          break;
        case "Bandwidth:":
          ticket += " mbps";
          break;
        case "Pathloss:":
          ticket += " dB";
          break;
        case "Radio Frequency:":
        case "Router Frequency:":
          ticket += " MHz";
          break;
        default:
          break;
      }
      if (currentLabel === "Local Signal:") {
        continue;
      }
      ticket += "\n";
    }
  }
  ticket += "Troubleshooting List: \n\n";
  for (let i = 0; i < previousPrompts.querySelectorAll("li").length; i++) {
    ticket +=
      previousPrompts.querySelectorAll("li")[i].querySelector("span")
        .innerText + "\n";
  }
  ticket += "\nNotes:\n\n" + document.querySelector("#notes").value;
  ticket += `\n${customer} ${customerID ? "Account: " + customerID : "" } ${customerPhoneNumber}`;
  clipboardConfirm.style.display = "flex";
  setTimeout(() => (clipboardConfirm.style.display = "none"), 5000);
  return navigator.clipboard.writeText(ticket);
}

//checks if current complaint is intermittent and called when moving through a no connection line
function intermittentCheck() {
  if (complaintSelect === "intermittentConnection") {
    intermittentRestored.style.cssText = "display:block;";
  }
}

//checks if an additional option was just chosen
function additionalOptionCheck() {
  const tempPromptRef = previousPrompts.lastChild.querySelector("span")
    .innerText;

  return (
    tempPromptRef.includes(
      "If you are unable to help the customer transfer to billing"
    ) ||
    tempPromptRef.includes("Please note why you are escalating") ||
    tempPromptRef.includes("The customer's issues are resolved") ||
    tempPromptRef.includes(
      "Ask the customer to call back when they are available to troubleshoot"
    ) ||
    tempPromptRef.includes("The customer's issues are resolved") ||
    tempPromptRef.includes("Escalate the call to Tier 2") ||
    tempPromptRef.includes(
      "Let the customer know we are working to restore the outage. If they ask for an ETA only provide one if you are given one."
    ) ||
    tempPromptRef.includes("exit")
  );
}

//reset tree and clear inputs
function resetPage() {
  const inputs = document.getElementsByTagName("input");
  for (let k = 0; k < inputs.length; k++) {
    inputs[k].value = "";
  }
  for (let n = 0; n < document.querySelectorAll(".radioInfo").length; n++) {
    document.querySelectorAll(".radioInfo")[n].style.display = "none";
  }
  issueTypeChange();
  colorChange();
  document.querySelector("textarea").value = "";
  document.querySelector("#additionalOptions").style.cssText = "display:none;";
  previousPrompts.innerHTML = "";
  options.innerHTML = "";
  createTicketButton.style.cssText = "display:none;";
  resetConfirm.style.cssText = "display: none;";
}

//changes border colors
function colorChange() {
  let currentColor;
  radioType = radioTypeInput.value;
  switch (radioType) {
    case "ubiquiti":
      currentColor = "#2a81fa";
      break;
    case "telrad":
      currentColor = "#bbc3fa";
      break;
    case "mimosa":
      currentColor = "#fa8e1b";
      break;
    case "cambium":
      currentColor = "#4c28fc";
      break;
    case "tarana":
      currentColor = "#239664";
      break;
    case "apartments":
      currentColor = "#cf0a76";
      break;
    default:
      currentColor = "#212121";
      break;
  }
  document.documentElement.style.setProperty("--color", currentColor);
}

//checks to see if an eventlistener needs to be added to li span lastChild which will check if they're the last child before firing
function eventListenerCheck(promptText) {
  let currentElementId = null;
  spanLastChild = previousPrompts.lastChild.querySelector("span");

  switch (promptText) {
    case "Kick the radio from the AP.":
      currentElementId = "apKick";
      break;
    case "Ensure that the router is up to date on firmware and has optimal settings":
    case "Ensure that the router/mesh is up to date on firmware and has optimal settings (if they instead only have a motorolla or nova mesh continue)":
      currentElementId = "optimalRouter";
      break;
    case "Ensure that the router/mesh frequency isn't the same as the radio and then check ping and bandwidth from the router/mesh.":
      currentElementId = "frequencyCheck";
      break;
    case "Power cycle the customer's equipment.":
      currentElementId = "powerCycle";
      break;
    case "Verify, at the minimum, two pieces of the customer's account information then provide or change the password in the router.":
      currentElementId = "passwordCheck";
      break;
    case "Is it airspan?":
      currentElementId = "airspan";
      break;
    case "If not on airspan make note if the cell the customer on is showing utilization over 80%":
    case "Looking at breezeview is the PCI/Cell for the customer up?":
      currentElementId = "breezeview";
      break;
    case "Are you able to access the AP?":
      currentElementId = "accessAps";
      break;
    case "Verify with the customer that from the cable that leads outside leads to the correct port on the router/mesh.":
    case "Verify with the customer that from the PoE there is a cable going from the port labeled PoE or OUT that leads outside, and the other port labeled LAN or IN leads to the correct port on the router/mesh.":
      currentElementId = "reseat";
      break;
    default:
      break;
  }

  if (currentElementId) {
    spanLastChild.classList.toggle("popup");
    spanLastChild.addEventListener("mousedown", () => {
      if (spanLastChild.innerText !== promptText) {
        return;
      }
      document.getElementById(currentElementId).style.cssText = "display:flex";
    });
  }
}

// sets the settings tab up to current settings
function setSettingsTab() {
  font.value = getComputedStyle(document.documentElement)
    .getPropertyValue("--primaryFont")
    .trim()
    .replace("px", "");
  notesFont.value = getComputedStyle(document.documentElement)
    .getPropertyValue("--notesFont")
    .trim()
    .replace("px", "");
  background.value = getComputedStyle(document.documentElement)
    .getPropertyValue("--background")
    .trim();
  foreground.value = getComputedStyle(document.documentElement)
    .getPropertyValue("--foreground")
    .trim();
  textColor.value = getComputedStyle(document.documentElement)
    .getPropertyValue("--textColor")
    .trim();
  linkColor.value = getComputedStyle(document.documentElement)
    .getPropertyValue("--linkColor")
    .trim();
  inputTextColor.value = getComputedStyle(document.documentElement)
    .getPropertyValue("--inputTextColor")
    .trim();
  inputBackgroundColor.value = getComputedStyle(document.documentElement)
    .getPropertyValue("--inputBackgroundColor")
    .trim();
  resetRadioOn.checked = settings.resetPrompt;
  resetRadioOff.checked = !settings.resetPrompt;
  fontExample("font");
  fontExample("notesFont");
}

// updates the example text for the font
function fontExample(element) {
  document.getElementById(element + "Value").innerText =
    "Size: " + (element === "font" ? +font.value : notesFont.value);
  document.getElementById(element + "Example").style.cssText =
    "font-size:" + (element === "font" ? font.value : notesFont.value) + "px;";
}

// updates information in json storage
function updateStorage() {
  settings = {
    font: font.value,
    notesFont: notesFont.value,
    background: background.value,
    foreground: foreground.value,
    textColor: textColor.value,
    linkColor: linkColor.value,
    inputTextColor: inputTextColor.value,
    inputBackgroundColor: inputBackgroundColor.value,
    resetPrompt: resetRadioOn.checked
  };
  updateSettings();
  localStorage.setItem("treesettings", JSON.stringify(settings));
}

//updates current css
function updateSettings() {
  document.documentElement.style.setProperty(
    "--primaryFont",
    settings.font + "px"
  );
  document.documentElement.style.setProperty(
    "--notesFont",
    settings.notesFont + "px"
  );
  document.documentElement.style.setProperty(
    "--background",
    settings.background
  );
  document.documentElement.style.setProperty(
    "--foreground",
    settings.foreground
  );
  document.documentElement.style.setProperty("--textColor", settings.textColor);
  document.documentElement.style.setProperty("--linkColor", settings.linkColor);
  document.documentElement.style.setProperty(
    "--inputTextColor",
    settings.inputTextColor
  );
  document.documentElement.style.setProperty(
    "--inputBackgroundColor",
    settings.inputBackgroundColor
  );
  resetPrompt = settings.resetPrompt;
  settingsContainer.style.cssText = "dispaly: none;";
  setSettingsTab();
  cog.style.transform = "rotate(0deg)";
}

// checks for new settings in default settings and adds them to the JSON if it exist
function checkForNewSettings() {
  const checkIfJSONExist =
    JSON.parse(localStorage.getItem("treesettings")) || false;
  let tempBool = false;
  if (!checkIfJSONExist) {
    console.log("no JSON");
    return;
  }
  for (const key in defaultSettings) {
    if (!checkIfJSONExist[key]) {
      settings[key] = defaultSettings[key];
      tempBool = true;
    }
  }
  console.log(tempBool ? "update complete" : "no update needed");
}

//sets up page on start up
function startUp() {
  settings =
    JSON.parse(localStorage.getItem("treesettings")) || defaultSettings;
  checkForNewSettings();
  updateSettings();
  resetPage();
}

startUp();

/* Things still needing worked on
 * adding more information to where its needed
 * add pop ups for more advanced troubleshooting
 * maybe add a instruction page on first time boot up
 * add retention line?
 *
 * known bugs:
 *
 */
