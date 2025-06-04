
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
<TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0"
                                      onClick={() => toggleUpdateExpansion(update.id)}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">{isExpanded ? "Collapse" : "Expand"}</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>

                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    
                                  </TooltipTrigger>
                                  <TooltipContent side="top">Delete</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
            <DropdownMenu
                    open={openDropdowns[expense.id] || false}
                    onOpenChange={(open) => setOpenDropdowns((prev) => ({ ...prev, [expense.id]: open }))}
                  >
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditExpense(expense)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleViewDetails(expense)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      {["pending", "draft"].includes(expense.status) && (
                        <>
                          <DropdownMenuItem onClick={() => handleApproveExpense(expense.id)} className="text-green-600">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleRejectExpense(expense.id)} className="text-red-600">
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </DropdownMenuItem>
                        </>
                      )}
                      {expense.status === "approved" && (
                        <DropdownMenuItem onClick={() => handleMarkAsPaid(expense.id)} className="text-blue-600">
                          <CreditCard className="h-4 w-4 mr-2" />
                          Mark as Paid
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuItem onClick={() => handleDeleteExpense(expense.id)} className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>