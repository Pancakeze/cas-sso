package com.example.cas.model.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * 人员信息查询请求 DTO（V2版本）
 * 接口地址: /uac/openAPI/queryPerson/v2
 * 按接口文档 6.1 规范
 */
public class PersonQueryV2Request {

    @JsonProperty("ids")
    private String ids;  // 人员唯一标识，ids对应的用令牌的pid

    @JsonProperty("idcard")
    private String idcard;  // 身份证号

    @JsonProperty("userName")
    private String userName;  // 姓名

    @JsonProperty("pinyin")
    private String pinyin;  // 姓名拼音

    @JsonProperty("orgCode")
    private String orgCode;  // 组织机构编码，可传多个，用逗号分开

    @JsonProperty("policeNo")
    private String policeNo;  // 警号

    @JsonProperty("start")
    private Integer start;  // 查询起始下标，默认0

    @JsonProperty("size")
    private Integer size;  // 数据页大小，默认1000

    // Getters and Setters
    public String getIds() {
        return ids;
    }

    public void setIds(String ids) {
        this.ids = ids;
    }

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

    public String getPinyin() {
        return pinyin;
    }

    public void setPinyin(String pinyin) {
        this.pinyin = pinyin;
    }

    public String getOrgCode() {
        return orgCode;
    }

    public void setOrgCode(String orgCode) {
        this.orgCode = orgCode;
    }

    public String getPoliceNo() {
        return policeNo;
    }

    public void setPoliceNo(String policeNo) {
        this.policeNo = policeNo;
    }

    public Integer getStart() {
        return start;
    }

    public void setStart(Integer start) {
        this.start = start;
    }

    public Integer getSize() {
        return size;
    }

    public void setSize(Integer size) {
        this.size = size;
    }

    @Override
    public String toString() {
        return "PersonQueryV2Request{" +
                "ids='" + ids + '\'' +
                ", idcard='" + idcard + '\'' +
                ", userName='" + userName + '\'' +
                ", pinyin='" + pinyin + '\'' +
                ", orgCode='" + orgCode + '\'' +
                ", policeNo='" + policeNo + '\'' +
                ", start=" + start +
                ", size=" + size +
                '}';
    }
}
