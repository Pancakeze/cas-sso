package com.example.cas.model.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

/**
 * 人员信息查询响应 DTO（V2版本）
 * 接口地址: /uac/openAPI/queryPerson/v2
 * 按接口文档 6.1 规范
 */
public class PersonQueryV2Response {

    @JsonProperty("status")
    private String status;  // 状态码，"0000" 表示成功

    @JsonProperty("message")
    private String message;  // 状态描述

    @JsonProperty("result")
    private PersonResult result;  // 查询结果

    public PersonQueryV2Response() {
    }

    public PersonQueryV2Response(String status, String message) {
        this.status = status;
        this.message = message;
    }

    // 内部类：查询结果
    public static class PersonResult {
        @JsonProperty("total")
        private Integer total;  // 总数

        @JsonProperty("rows")
        private List<PersonDetail> rows;  // 数据行

        public Integer getTotal() {
            return total;
        }

        public void setTotal(Integer total) {
            this.total = total;
        }

        public List<PersonDetail> getRows() {
            return rows;
        }

        public void setRows(List<PersonDetail> rows) {
            this.rows = rows;
        }
    }

    // 内部类：人员详细信息
    public static class PersonDetail {
        @JsonProperty("pid")
        private String pid;  // 人员唯一标识

        @JsonProperty("userName")
        private String userName;  // 姓名

        @JsonProperty("idcard")
        private String idcard;  // 身份证号

        @JsonProperty("orgCode")
        private String orgCode;  // 组织机构编码

        @JsonProperty("orgName")
        private String orgName;  // 组织机构名称

        @JsonProperty("policeNo")
        private String policeNo;  // 警号

        @JsonProperty("phone")
        private String phone;  // 电话

        @JsonProperty("email")
        private String email;  // 邮箱

        @JsonProperty("pinyin")
        private String pinyin;  // 拼音

        // Getters and Setters
        public String getPid() {
            return pid;
        }

        public void setPid(String pid) {
            this.pid = pid;
        }

        public String getUserName() {
            return userName;
        }

        public void setUserName(String userName) {
            this.userName = userName;
        }

        public String getIdcard() {
            return idcard;
        }

        public void setIdcard(String idcard) {
            this.idcard = idcard;
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

        public String getPinyin() {
            return pinyin;
        }

        public void setPinyin(String pinyin) {
            this.pinyin = pinyin;
        }
    }

    // Getters and Setters
    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public PersonResult getResult() {
        return result;
    }

    public void setResult(PersonResult result) {
        this.result = result;
    }
}
