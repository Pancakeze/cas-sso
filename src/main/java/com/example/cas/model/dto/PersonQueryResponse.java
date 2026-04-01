package com.example.cas.model.dto;

import java.util.List;
import java.util.Map;

/**
 * 人员信息查询响应
 */
public class PersonQueryResponse {
    private String status;          // 状态码，"0000" 表示成功
    private String message;         // 消息
    private boolean success;
    private PersonResult result;    // 结果数据

    public PersonQueryResponse() {}

    public PersonQueryResponse(String status, String message) {
        this.status = status;
        this.message = message;
        this.success = "0000".equals(status);
    }

    // Getters and Setters
    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
        this.success = "0000".equals(status);
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public PersonResult getResult() {
        return result;
    }

    public void setResult(PersonResult result) {
        this.result = result;
    }

    /**
     * 人员查询结果
     */
    public static class PersonResult {
        private Integer total;           // 总数
        private List<PersonInfo> rows;  // 数据列表

        public Integer getTotal() {
            return total;
        }

        public void setTotal(Integer total) {
            this.total = total;
        }

        public List<PersonInfo> getRows() {
            return rows;
        }

        public void setRows(List<PersonInfo> rows) {
            this.rows = rows;
        }
    }

    /**
     * 人员详细信息
     */
    public static class PersonInfo {
        private String idcard;          // 身份证号
        private String userName;        // 姓名
        private String pid;             // 用户ID
        private String orgCode;         // 组织代码
        private String orgName;         // 组织名称
        private String policeNo;         // 警号
        private String phone;           // 电话
        private String email;          // 邮箱
        private Map<String, Object> extra;  // 扩展信息

        // Getters and Setters
        public String getIdcard() {
            return idcard;
        }

        public void setIdcard(String idcard) {
            this.idcard = idcard;
        }

        public String getUserName() {
            return userName;
        }

        public void setUserName(String userName) {
            this.userName = userName;
        }

        public String getPid() {
            return pid;
        }

        public void setPid(String pid) {
            this.pid = pid;
        }

        public String getOrgCode() {
            return orgCode;
        }

        public void setOrgCode(String orgCode) {
            this.orgCode = orgCode;
        }

        public String getOrgName() {
            return orgName;
        }

        public void setOrgName(String orgName) {
            this.orgName = orgName;
        }

        public String getPoliceNo() {
            return policeNo;
        }

        public void setPoliceNo(String policeNo) {
            this.policeNo = policeNo;
        }

        public String getPhone() {
            return phone;
        }

        public void setPhone(String phone) {
            this.phone = phone;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public Map<String, Object> getExtra() {
            return extra;
        }

        public void setExtra(Map<String, Object> extra) {
            this.extra = extra;
        }
    }
}
